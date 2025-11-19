/**
 * Provider Class
 * Manages individual AI provider settings and API interactions
 */
class Provider {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.name = data.name || 'Custom Provider';
        this.baseUrl = data.baseUrl || '';
        this.apiKey = data.apiKey || '';
        this.apiKeyRequired = data.apiKeyRequired !== undefined ? data.apiKeyRequired : true;
        this.enabled = data.enabled !== undefined ? data.enabled : false;
        this.models = data.models || [];
        this.defaultModel = data.defaultModel || (this.models[0]?.id || '');
        this.headers = data.headers || { 'Content-Type': 'application/json' };
        this.requestFormat = data.requestFormat || 'openai'; // openai, anthropic, google, custom
        this.color = data.color || '#6366f1';
        this.customRequestTransform = data.customRequestTransform || null;
        this.customResponseTransform = data.customResponseTransform || null;
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    generateId() {
        return 'provider_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Validate provider configuration
     */
    validate() {
        const errors = [];
        if (!this.name || this.name.trim() === '') {
            errors.push('Provider name is required');
        }
        if (!this.baseUrl || this.baseUrl.trim() === '') {
            errors.push('Base URL is required');
        }
        if (this.apiKeyRequired && (!this.apiKey || this.apiKey.trim() === '')) {
            errors.push('API key is required for this provider');
        }
        if (!this.models || this.models.length === 0) {
            errors.push('At least one model is required');
        }
        return errors;
    }

    /**
     * Add a model to the provider
     */
    addModel(model) {
        if (!model.id || !model.name) {
            throw new Error('Model must have an id and name');
        }
        this.models.push({
            id: model.id,
            name: model.name,
            contextWindow: model.contextWindow || 4096
        });
        if (this.models.length === 1) {
            this.defaultModel = model.id;
        }
        this.updatedAt = Date.now();
    }

    /**
     * Remove a model from the provider
     */
    removeModel(modelId) {
        this.models = this.models.filter(m => m.id !== modelId);
        if (this.defaultModel === modelId && this.models.length > 0) {
            this.defaultModel = this.models[0].id;
        }
        this.updatedAt = Date.now();
    }

    /**
     * Update a model
     */
    updateModel(modelId, updates) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            Object.assign(model, updates);
            this.updatedAt = Date.now();
        }
    }

    /**
     * Transform request based on provider format
     */
    transformRequest(messages, model, options = {}) {
        const baseRequest = {
            model: model || this.defaultModel,
            stream: options.stream !== undefined ? options.stream : true,
            ...options
        };

        switch (this.requestFormat) {
            case 'openai':
                return {
                    ...baseRequest,
                    messages: messages
                };

            case 'anthropic':
                // Claude uses a different format
                const systemMessages = messages.filter(m => m.role === 'system');
                const nonSystemMessages = messages.filter(m => m.role !== 'system');
                return {
                    model: baseRequest.model,
                    messages: nonSystemMessages,
                    system: systemMessages.length > 0 ? systemMessages[0].content : undefined,
                    max_tokens: options.max_tokens || 4096,
                    stream: baseRequest.stream
                };

            case 'google':
                // Gemini format
                return {
                    contents: messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    })),
                    generationConfig: {
                        temperature: options.temperature,
                        maxOutputTokens: options.max_tokens,
                    }
                };

            case 'custom':
                // Use custom transform function if provided
                if (this.customRequestTransform) {
                    return this.customRequestTransform(messages, model, options);
                }
                return baseRequest;

            default:
                return {
                    ...baseRequest,
                    messages: messages
                };
        }
    }

    /**
     * Get API endpoint for chat completions
     */
    getEndpoint(model) {
        switch (this.requestFormat) {
            case 'openai':
            case 'anthropic':
                return `${this.baseUrl}/chat/completions`;
            
            case 'google':
                return `${this.baseUrl}/models/${model || this.defaultModel}:streamGenerateContent?key=${this.apiKey}`;
            
            default:
                return `${this.baseUrl}/chat/completions`;
        }
    }

    /**
     * Get request headers
     */
    getHeaders() {
        const headers = { ...this.headers };
        
        if (this.apiKey && this.requestFormat !== 'google') {
            if (this.requestFormat === 'anthropic') {
                headers['x-api-key'] = this.apiKey;
            } else {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }
        }
        
        return headers;
    }

    /**
     * Send a chat completion request
     */
    async sendRequest(messages, model, options = {}) {
        const errors = this.validate();
        if (errors.length > 0) {
            throw new Error(`Provider validation failed: ${errors.join(', ')}`);
        }

        const endpoint = this.getEndpoint(model);
        const headers = this.getHeaders();
        const body = this.transformRequest(messages, model, options);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }

            return response;
        } catch (error) {
            console.error('Provider request error:', error);
            throw error;
        }
    }

    /**
     * Parse streaming response
     */
    async *streamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmedLine.slice(6);
                            const data = JSON.parse(jsonStr);
                            
                            let content = null;
                            
                            // Parse based on format
                            switch (this.requestFormat) {
                                case 'openai':
                                    content = data.choices?.[0]?.delta?.content;
                                    break;
                                case 'anthropic':
                                    if (data.type === 'content_block_delta') {
                                        content = data.delta?.text;
                                    }
                                    break;
                                case 'google':
                                    content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                                    break;
                                default:
                                    content = data.choices?.[0]?.delta?.content;
                            }

                            if (content) {
                                yield content;
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e, trimmedLine);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            baseUrl: this.baseUrl,
            apiKey: this.apiKey,
            apiKeyRequired: this.apiKeyRequired,
            enabled: this.enabled,
            models: this.models,
            defaultModel: this.defaultModel,
            headers: this.headers,
            requestFormat: this.requestFormat,
            color: this.color,
            customRequestTransform: this.customRequestTransform,
            customResponseTransform: this.customResponseTransform,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Clone the provider
     */
    clone() {
        return new Provider(this.toJSON());
    }
}

/**
 * Provider Manager Class
 * Manages all AI providers
 */
class ProviderManager {
    constructor(db) {
        this.db = db;
        this.providers = new Map();
        this.activeProviderId = null;
    }

    /**
     * Initialize providers from database
     */
    async init() {
        // Load providers from database
        const savedProviders = await this.db.getAll('providers');
        
        if (savedProviders.length === 0) {
            // Initialize with default providers
            for (const providerData of DEFAULT_PROVIDERS) {
                const provider = new Provider(providerData);
                this.providers.set(provider.id, provider);
                await this.db.put('providers', provider.toJSON());
            }
        } else {
            // Load saved providers
            for (const data of savedProviders) {
                const provider = new Provider(data);
                this.providers.set(provider.id, provider);
            }
        }

        // Load active provider
        this.activeProviderId = await this.db.getSetting('activeProvider');
        
        // If no active provider, try to find first enabled one
        if (!this.activeProviderId) {
            const enabledProvider = Array.from(this.providers.values()).find(p => p.enabled);
            if (enabledProvider) {
                this.activeProviderId = enabledProvider.id;
                await this.db.setSetting('activeProvider', this.activeProviderId);
            }
        }
    }

    /**
     * Get all providers
     */
    getAllProviders() {
        return Array.from(this.providers.values());
    }

    /**
     * Get enabled providers
     */
    getEnabledProviders() {
        return Array.from(this.providers.values()).filter(p => p.enabled);
    }

    /**
     * Get provider by ID
     */
    getProvider(id) {
        return this.providers.get(id);
    }

    /**
     * Get active provider
     */
    getActiveProvider() {
        return this.providers.get(this.activeProviderId);
    }

    /**
     * Set active provider
     */
    async setActiveProvider(id) {
        if (!this.providers.has(id)) {
            throw new Error('Provider not found');
        }
        this.activeProviderId = id;
        await this.db.setSetting('activeProvider', id);
    }

    /**
     * Add a new provider
     */
    async addProvider(providerData) {
        const provider = new Provider(providerData);
        const errors = provider.validate();
        
        if (errors.length > 0) {
            throw new Error(`Provider validation failed: ${errors.join(', ')}`);
        }

        this.providers.set(provider.id, provider);
        await this.db.put('providers', provider.toJSON());
        return provider;
    }

    /**
     * Update a provider
     */
    async updateProvider(id, updates) {
        const provider = this.providers.get(id);
        if (!provider) {
            throw new Error('Provider not found');
        }

        Object.assign(provider, updates);
        provider.updatedAt = Date.now();
        
        await this.db.put('providers', provider.toJSON());
        return provider;
    }

    /**
     * Delete a provider
     */
    async deleteProvider(id) {
        if (!this.providers.has(id)) {
            throw new Error('Provider not found');
        }

        this.providers.delete(id);
        await this.db.delete('providers', id);

        // If this was the active provider, select another
        if (this.activeProviderId === id) {
            const enabledProviders = this.getEnabledProviders();
            if (enabledProviders.length > 0) {
                await this.setActiveProvider(enabledProviders[0].id);
            } else {
                this.activeProviderId = null;
                await this.db.setSetting('activeProvider', null);
            }
        }
    }

    /**
     * Get all models from all enabled providers
     */
    getAllModels() {
        const models = [];
        for (const provider of this.getEnabledProviders()) {
            for (const model of provider.models) {
                models.push({
                    ...model,
                    providerId: provider.id,
                    providerName: provider.name,
                    providerColor: provider.color,
                    fullId: `${provider.id}/${model.id}`
                });
            }
        }
        return models;
    }

    /**
     * Parse model full ID (providerId/modelId) and get provider and model
     */
    parseModelId(fullModelId) {
        const parts = fullModelId.split('/');
        if (parts.length < 2) {
            // Assume it's from active provider
            const activeProvider = this.getActiveProvider();
            return {
                provider: activeProvider,
                modelId: fullModelId
            };
        }
        
        const providerId = parts[0];
        const modelId = parts.slice(1).join('/');
        const provider = this.getProvider(providerId);
        
        return { provider, modelId };
    }
}
