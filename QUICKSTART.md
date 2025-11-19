# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Upload Files to GitHub

Upload these files to your GitHub repository:

```
your-repo/
├── db.js
├── providers-config.js
├── provider.js
├── chat.js
├── project.js
└── integration-example.html (or index.html)
```

### Step 2: Enable GitHub Pages

1. Go to your repository Settings
2. Navigate to "Pages" section
3. Select branch: `main` and folder: `/ (root)`
4. Save and wait for deployment

### Step 3: Access Your App

Visit: `https://your-username.github.io/your-repo-name/integration-example.html`

### Step 4: Configure Your First Provider

1. Choose a provider (e.g., OpenAI, Anthropic, Groq)
2. Enable it using the toggle switch
3. Enter your API key in the password field
4. Select a model from the dropdown
5. Start chatting!

## 📝 Testing Locally

You can also test locally using Python's built-in server:

```bash
# In your project directory
python3 -m http.server 8000

# Then visit: http://localhost:8000/integration-example.html
```

## 🔑 Getting API Keys

### Free Options:

**Groq** (Fast, free tier):
- Visit: https://console.groq.com
- Sign up and get free API key
- Very fast inference, good for testing

**OpenRouter** (Access multiple models):
- Visit: https://openrouter.ai
- Free tier available
- Access to many models including Claude, GPT, Gemini

### Paid Options:

**OpenAI**: https://platform.openai.com/api-keys
**Anthropic (Claude)**: https://console.anthropic.com
**Google (Gemini)**: https://makersuite.google.com/app/apikey
**DeepSeek**: https://platform.deepseek.com

## 🎨 Using the Application

### Basic Chat Flow:

1. **Select Model**: Choose from dropdown (shows all models from enabled providers)
2. **Type Message**: Enter your question/prompt
3. **Send**: Press Enter or click Send button
4. **View Response**: See AI response stream in real-time

### Managing Providers:

**Enable/Disable**: Toggle switch on each provider card
**Add API Key**: Enter in the password field
**Add Custom Provider**: Click "+ Add Custom Provider" button

### Custom Provider Setup:

1. Click "+ Add Custom Provider"
2. Enter:
   - Name (e.g., "My Custom API")
   - Base URL (e.g., "https://api.example.com/v1")
   - API Key (if required)
   - Request Format (OpenAI/Anthropic/Google compatible)
3. Save

## 🔧 Common Issues

### "No models available"
→ Enable at least one provider and enter its API key

### "API request failed"
→ Check your API key is correct and has credits
→ Verify the provider is enabled
→ Check browser console for detailed error

### Models not loading
→ Refresh the page
→ Check that provider.enabled = true
→ Verify API key is set

### CORS errors
→ This is expected when testing locally without a server
→ Deploy to GitHub Pages or use local server (python -m http.server)

## 🎯 Next Steps

1. **Read README.md** for complete architecture documentation
2. **Customize providers-config.js** to add more models
3. **Implement full UI** from your original index_2.html
4. **Add features**: Projects, chat history, export, etc.

## 💡 Integration Tips

### To integrate with your existing UI:

1. Keep your existing HTML structure and styles
2. Add the script includes from integration-example.html
3. Replace your initialization code with the new managers
4. Update your chat sending logic to use `provider.sendRequest()`
5. Add provider management UI to your settings page

### Key Integration Points:

```javascript
// 1. Initialize (in your initializeApp function)
db = new DatabaseManager();
await db.init();
providerManager = new ProviderManager(db);
await providerManager.init();
chatManager = new ChatManager(db);
await chatManager.init();

// 2. Send messages (in your sendMessage function)
const { provider, modelId } = providerManager.parseModelId(selectedModel);
const messages = chat.getMessagesForAPI();
const response = await provider.sendRequest(messages, modelId, { stream: true });

// 3. Handle streaming
for await (const chunk of provider.streamResponse(response)) {
    // Update UI with chunk
}
```

## 📚 Resources

- **README.md**: Complete architecture and API documentation
- **integration-example.html**: Working example with all features
- **providers-config.js**: Default provider configurations

## 🆘 Getting Help

Check the browser console (F12) for error messages. Most issues are:
- Missing API keys
- Disabled providers
- Invalid API endpoints
- CORS issues (use GitHub Pages or local server)

## 🎉 Success!

If you can see providers, select models, and send messages, you're all set! 

The application now supports:
✅ Multiple AI providers
✅ Custom providers
✅ Per-provider model management
✅ IndexedDB storage
✅ Streaming responses
✅ Chat history
✅ Project organization

Enjoy your multi-provider AI chat! 🤖
