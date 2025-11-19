# AI Chat - Multi-Provider Architecture

## Overview

This application has been refactored into a modern, class-based architecture with support for multiple AI providers including OpenAI, Claude, Gemini, DeepSeek, Groq, and custom providers.

## File Structure

```
├── index.html          # Main application file
├── db.js              # IndexedDB database manager
├── providers-config.js # Default provider configurations
├── provider.js        # Provider class and manager
├── chat.js            # Chat class and manager
└── project.js         # Project class and manager
```

## Architecture

### 1. Database Manager (db.js)
Handles all IndexedDB operations with stores for:
- `providers` - AI provider configurations
- `chats` - Chat conversations
- `projects` - Project/folder organization
- `settings` - Application settings

### 2. Provider System (provider.js + providers-config.js)

**Provider Class** - Manages individual AI providers:
- Stores API keys, base URLs, and models
- Handles request/response transformations for different API formats
- Supports OpenAI, Anthropic, Google, and custom formats
- Manages streaming responses

**ProviderManager Class** - Manages all providers:
- Loads providers from database
- Handles provider selection and switching
- Aggregates models from all enabled providers
- Validates provider configurations

**Supported Providers** (pre-configured):
- OpenAI (GPT-4o, GPT-4, GPT-3.5)
- Anthropic/Claude (Claude 4.5, Claude 3.5, Claude 3)
- Google Gemini (Gemini 2.0, Gemini 1.5 Pro/Flash)
- DeepSeek (DeepSeek Chat, DeepSeek Coder)
- Groq (Llama 3.3, Mixtral, Gemma)
- OpenRouter (Multi-model access)
- xAI (Grok)
- Mistral AI
- Perplexity

### 3. Chat System (chat.js)

**Chat Class** - Manages individual conversations:
- Stores messages with timestamps and metadata
- Auto-generates titles from first message
- Supports export to JSON, Markdown, and Text
- Handles system prompts and temperature settings

**ChatManager Class** - Manages all chats:
- CRUD operations for chats
- Project-based organization
- Search functionality
- Statistics and analytics

### 4. Project System (project.js)

**Project Class** - Groups related chats:
- Custom names, descriptions, colors, and icons
- Metadata support for extensibility

**ProjectManager Class** - Manages all projects:
- Project CRUD operations
- Chat-project associations
- Project statistics

## Integration Guide

### HTML Structure Required

```html
<!-- Include all JS files in order -->
<script src="./db.js"></script>
<script src="./providers-config.js"></script>
<script src="./provider.js"></script>
<script src="./chat.js"></script>
<script src="./project.js"></script>
```

### Initialization Code

```javascript
// Global managers
let db, providerManager, chatManager, projectManager;

async function initializeApp() {
    // 1. Initialize database
    db = new DatabaseManager();
    await db.init();
    
    // 2. Initialize managers
    providerManager = new ProviderManager(db);
    await providerManager.init();
    
    chatManager = new ChatManager(db);
    await chatManager.init();
    
    projectManager = new ProjectManager(db);
    await projectManager.init();
    
    // 3. Render UI
    renderProviders();
    renderChats();
    renderProjects();
}
```

### Using Providers

```javascript
// Get active provider
const provider = providerManager.getActiveProvider();

// Send a chat request
const chat = chatManager.getCurrentChat();
const messages = chat.getMessagesForAPI();

try {
    const response = await provider.sendRequest(
        messages,
        'gpt-4o', // model ID
        { stream: true, temperature: 0.7 }
    );
    
    // Handle streaming response
    for await (const chunk of provider.streamResponse(response)) {
        // Update UI with chunk
        console.log(chunk);
    }
} catch (error) {
    console.error('Request failed:', error);
}
```

### Provider Management UI

Key UI components needed:

1. **Provider List** - Show all providers with enable/disable toggles
2. **Provider Editor** - Add/edit custom providers
3. **Model Selector** - Dropdown with all models from enabled providers
4. **API Key Manager** - Secure input for API keys per provider

### Model Selection

Models are now namespaced by provider:

```javascript
// Get all available models
const models = providerManager.getAllModels();

// Each model has:
{
    id: 'gpt-4o',
    name: 'GPT-4o',
    providerId: 'openai',
    providerName: 'OpenAI',
    providerColor: '#10a37f',
    fullId: 'openai/gpt-4o', // Use this for selection
    contextWindow: 128000
}

// Parse model selection
const { provider, modelId } = providerManager.parseModelId('openai/gpt-4o');
```

## UI Components Needed

### 1. Settings Page - Providers Tab

```html
<div id="providersTab" class="space-y-4">
    <!-- Provider cards -->
    <div id="providersList"></div>
    
    <!-- Add custom provider button -->
    <button onclick="showAddProviderDialog()">
        + Add Custom Provider
    </button>
</div>
```

### 2. Provider Card Template

```javascript
function renderProviderCard(provider) {
    return `
        <div class="glass rounded-lg p-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg" 
                         style="background: ${provider.color}">
                    </div>
                    <div>
                        <h3 class="font-semibold">${provider.name}</h3>
                        <p class="text-sm opacity-70">${provider.models.length} models</p>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                           ${provider.enabled ? 'checked' : ''}
                           onchange="toggleProvider('${provider.id}')"
                           class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-600 peer-checked:bg-blue-600 rounded-full"></div>
                </label>
            </div>
            
            ${provider.apiKeyRequired ? `
                <input type="password" 
                       value="${provider.apiKey}"
                       placeholder="API Key"
                       onchange="updateProviderKey('${provider.id}', this.value)"
                       class="mt-3 w-full bg-white/10 border border-white/20 rounded px-3 py-2">
            ` : ''}
            
            <button onclick="editProvider('${provider.id}')" 
                    class="mt-2 text-sm opacity-70 hover:opacity-100">
                Edit Models & Settings
            </button>
        </div>
    `;
}
```

### 3. Model Selector

```javascript
function renderModelSelector() {
    const models = providerManager.getAllModels();
    const currentModel = await db.getSetting('selectedModel', models[0]?.fullId);
    
    return `
        <select id="modelSelect" class="model-selector">
            ${models.map(model => `
                <option value="${model.fullId}" 
                        ${model.fullId === currentModel ? 'selected' : ''}>
                    ${model.providerName}: ${model.name}
                </option>
            `).join('')}
        </select>
    `;
}
```

### 4. Custom Provider Dialog

```javascript
function showAddProviderDialog() {
    const html = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>Add Custom Provider</h2>
                <form onsubmit="saveCustomProvider(event)">
                    <input name="name" placeholder="Provider Name" required>
                    <input name="baseUrl" placeholder="API Base URL" required>
                    <input name="apiKey" type="password" placeholder="API Key">
                    
                    <select name="requestFormat">
                        <option value="openai">OpenAI Compatible</option>
                        <option value="anthropic">Anthropic/Claude</option>
                        <option value="google">Google/Gemini</option>
                    </select>
                    
                    <div id="modelsContainer">
                        <h3>Models</h3>
                        <button type="button" onclick="addModelField()">+ Add Model</button>
                    </div>
                    
                    <button type="submit">Save Provider</button>
                </form>
            </div>
        </div>
    `;
    // Show dialog
}
```

## Request Format Support

### OpenAI Format (Default)
Used by: OpenAI, DeepSeek, Groq, OpenRouter, xAI, Mistral, Perplexity

```javascript
{
    model: "gpt-4o",
    messages: [
        { role: "user", content: "Hello" }
    ],
    stream: true,
    temperature: 0.7
}
```

### Anthropic Format
Used by: Claude API

```javascript
{
    model: "claude-sonnet-4-5-20250929",
    messages: [
        { role: "user", content: "Hello" }
    ],
    system: "You are a helpful assistant",
    max_tokens: 4096,
    stream: true
}
```

### Google Format
Used by: Gemini API

```javascript
{
    contents: [
        {
            role: "user",
            parts: [{ text: "Hello" }]
        }
    ],
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096
    }
}
```

## Security Notes

- API keys are stored in IndexedDB (client-side only)
- No server-side storage - all data stays in browser
- Use HTTPS when hosting
- Consider encrypting sensitive data for production use

## Browser Compatibility

- IndexedDB support required
- Modern browsers (Chrome 60+, Firefox 55+, Safari 11+)
- ES6+ JavaScript support

## GitHub Pages Deployment

1. Upload all files to your repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch / (root)
4. Access at: `https://username.github.io/repository-name/`

## Future Enhancements

- [ ] Provider usage statistics
- [ ] Model performance metrics
- [ ] Cost tracking per provider
- [ ] Prompt templates
- [ ] Conversation forking
- [ ] Multi-model comparisons
- [ ] Import/export all data
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts customization

## Troubleshooting

### Provider not working?
1. Check API key is correct
2. Verify provider is enabled
3. Check browser console for errors
4. Verify base URL is correct

### No models showing?
1. Enable at least one provider
2. Check provider has models configured
3. Refresh the page

### Database errors?
1. Clear IndexedDB in browser dev tools
2. Refresh the page
3. Check browser console for details

## Contributing

This is a standalone, client-side application. To modify:

1. Edit the relevant .js file
2. Test in browser
3. Deploy updated files to GitHub Pages

No build process required!
