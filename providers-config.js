/**
 * Default AI Providers Configuration
 * Contains default settings for major AI providers
 */
const DEFAULT_PROVIDERS = [
    {
        id: 'openai',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000 },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000 },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000 },
            { id: 'gpt-4', name: 'GPT-4', contextWindow: 8192 },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385 }
        ],
        defaultModel: 'gpt-4o-mini',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai', // openai, anthropic, google, custom
        color: '#10a37f'
    },
    {
        id: 'anthropic',
        name: 'Anthropic (Claude)',
        baseUrl: 'https://api.anthropic.com/v1',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', contextWindow: 200000 },
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextWindow: 200000 },
            { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextWindow: 200000 },
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextWindow: 200000 },
            { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', contextWindow: 200000 },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', contextWindow: 200000 }
        ],
        defaultModel: 'claude-sonnet-4-5-20250929',
        headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        },
        requestFormat: 'anthropic',
        color: '#d97757'
    },
    {
        id: 'google',
        name: 'Google (Gemini)',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental', contextWindow: 1000000 },
            { id: 'gemini-exp-1206', name: 'Gemini Exp 1206', contextWindow: 2000000 },
            { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', contextWindow: 2000000 },
            { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', contextWindow: 1000000 },
            { id: 'gemini-pro', name: 'Gemini Pro', contextWindow: 32760 }
        ],
        defaultModel: 'gemini-2.0-flash-exp',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'google',
        color: '#4285f4'
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com/v1',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'deepseek-chat', name: 'DeepSeek Chat', contextWindow: 32768 },
            { id: 'deepseek-coder', name: 'DeepSeek Coder', contextWindow: 16384 }
        ],
        defaultModel: 'deepseek-chat',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai',
        color: '#00d4aa'
    },
    {
        id: 'groq',
        name: 'Groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', contextWindow: 128000 },
            { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', contextWindow: 128000 },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', contextWindow: 128000 },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextWindow: 32768 },
            { id: 'gemma2-9b-it', name: 'Gemma 2 9B', contextWindow: 8192 }
        ],
        defaultModel: 'llama-3.3-70b-versatile',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai',
        color: '#f55036'
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4.5', contextWindow: 200000 },
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', contextWindow: 200000 },
            { id: 'openai/gpt-4o', name: 'GPT-4o', contextWindow: 128000 },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000 },
            { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', contextWindow: 1000000 },
            { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', contextWindow: 2000000 },
            { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', contextWindow: 128000 },
            { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', contextWindow: 32768 },
            { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', contextWindow: 32768 }
        ],
        defaultModel: 'anthropic/claude-sonnet-4-5',
        headers: {
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href,
            'X-Title': 'AI Chat'
        },
        requestFormat: 'openai',
        color: '#7c3aed'
    },
    {
        id: 'xai',
        name: 'xAI (Grok)',
        baseUrl: 'https://api.x.ai/v1',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'grok-beta', name: 'Grok Beta', contextWindow: 131072 },
            { id: 'grok-vision-beta', name: 'Grok Vision Beta', contextWindow: 8192 }
        ],
        defaultModel: 'grok-beta',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai',
        color: '#000000'
    },
    {
        id: 'mistral',
        name: 'Mistral AI',
        baseUrl: 'https://api.mistral.ai/v1',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'mistral-large-latest', name: 'Mistral Large', contextWindow: 128000 },
            { id: 'mistral-medium-latest', name: 'Mistral Medium', contextWindow: 32000 },
            { id: 'mistral-small-latest', name: 'Mistral Small', contextWindow: 32000 },
            { id: 'open-mistral-7b', name: 'Open Mistral 7B', contextWindow: 32000 }
        ],
        defaultModel: 'mistral-large-latest',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai',
        color: '#ff7000'
    },
    {
        id: 'perplexity',
        name: 'Perplexity',
        baseUrl: 'https://api.perplexity.ai',
        apiKeyRequired: true,
        enabled: false,
        models: [
            { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large Online', contextWindow: 127072 },
            { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small Online', contextWindow: 127072 },
            { id: 'llama-3.1-sonar-large-128k-chat', name: 'Sonar Large Chat', contextWindow: 127072 },
            { id: 'llama-3.1-sonar-small-128k-chat', name: 'Sonar Small Chat', contextWindow: 127072 }
        ],
        defaultModel: 'llama-3.1-sonar-large-128k-online',
        headers: {
            'Content-Type': 'application/json'
        },
        requestFormat: 'openai',
        color: '#20808d'
    }
];
