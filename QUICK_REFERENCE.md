# 🚀 Quick Reference Card

## ⚡ 30-Second Start

```bash
# 1. Download all files
# 2. Start local server
python3 -m http.server 8000

# 3. Open browser
http://localhost:8000/integration-example.html

# 4. Enable a provider (Groq is free!)
# 5. Add API key
# 6. Start chatting!
```

## 📦 Files You Need

```
✅ db.js                    - Database
✅ providers-config.js      - 10 providers  
✅ provider.js              - API handler
✅ chat.js                  - Conversations
✅ project.js               - Organization
✅ integration-example.html - UI
```

## 🔑 Free API Keys

| Provider | Get Key | Speed | Notes |
|----------|---------|-------|-------|
| **Groq** | [console.groq.com](https://console.groq.com) | ⚡⚡⚡ | FASTEST, free tier |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai) | ⚡⚡ | Multi-model access |
| **Gemini** | [makersuite.google.com](https://makersuite.google.com/app/apikey) | ⚡⚡ | Google's models |

## 💻 Code Snippets

### Initialize App
```javascript
db = new DatabaseManager();
await db.init();
providerManager = new ProviderManager(db);
await providerManager.init();
chatManager = new ChatManager(db);
await chatManager.init();
```

### Send Message
```javascript
const provider = providerManager.getActiveProvider();
const chat = chatManager.getCurrentChat();
const messages = chat.getMessagesForAPI();

const response = await provider.sendRequest(
    messages, 
    'gpt-4o', 
    { stream: true }
);

for await (const chunk of provider.streamResponse(response)) {
    console.log(chunk);
}
```

### Add Custom Provider
```javascript
await providerManager.addProvider({
    name: 'My API',
    baseUrl: 'https://api.example.com/v1',
    apiKey: 'sk-...',
    requestFormat: 'openai',
    models: [
        { id: 'model-1', name: 'Model 1', contextWindow: 4096 }
    ]
});
```

## 🎨 UI Functions

```javascript
// Toggle provider
toggleProvider(providerId, enabled)

// Update API key
updateProviderKey(providerId, apiKey)

// Send message
sendMessage()

// Add provider
showAddProviderDialog()
```

## 🗄️ Data Access

```javascript
// Providers
const all = providerManager.getAllProviders();
const enabled = providerManager.getEnabledProviders();
const active = providerManager.getActiveProvider();

// Chats
const chats = chatManager.getAllChats();
const current = chatManager.getCurrentChat();
const search = chatManager.searchChats('query');

// Models
const models = providerManager.getAllModels();
```

## 🐛 Debug Commands

```javascript
// In browser console:

// Check providers
console.log(providerManager.getAllProviders());

// Check active provider
console.log(providerManager.getActiveProvider());

// Check current chat
console.log(chatManager.getCurrentChat());

// Check database
console.log(db);

// Clear all data (CAREFUL!)
await db.clearStore('providers');
await db.clearStore('chats');
```

## 📊 Pre-configured Providers

```
1. OpenAI      - GPT-4o, GPT-4, GPT-3.5
2. Anthropic   - Claude 4.5, 3.5, 3
3. Google      - Gemini 2.0, 1.5
4. DeepSeek    - Chat, Coder
5. Groq        - Llama 3.3, Mixtral ⚡
6. OpenRouter  - Multi-model access
7. xAI         - Grok
8. Mistral     - Large, Medium, Small
9. Perplexity  - Sonar models
10. Custom     - Add your own!
```

## 🔧 Common Tasks

### Enable Provider
1. Find provider card in UI
2. Toggle switch ON
3. Enter API key
4. Select model from dropdown

### Add Custom Provider
1. Click "+ Add Custom Provider"
2. Fill in:
   - Name: "My API"
   - URL: "https://api.example.com/v1"
   - API Key: "sk-..."
   - Format: "openai"
3. Save
4. Enable it
5. Add models manually if needed

### Export Chat
```javascript
const chat = chatManager.getCurrentChat();

// As JSON
const json = chat.export('json');

// As Markdown
const md = chat.export('markdown');

// As Text
const txt = chat.export('text');
```

### Create Project
```javascript
const project = await projectManager.createProject({
    name: 'Work Chats',
    description: 'All work-related conversations',
    color: '#3b82f6',
    icon: '💼'
});

// Assign chat to project
await chatManager.updateChat(chatId, { 
    projectId: project.id 
});
```

## 🚨 Error Messages

| Error | Solution |
|-------|----------|
| "No models available" | Enable a provider |
| "API key required" | Add API key for provider |
| "API request failed" | Check API key, credits, network |
| "Provider not found" | Provider disabled or deleted |
| CORS error | Use server or GitHub Pages |

## 📱 File Sizes

```
db.js                5.2 KB    148 lines
providers-config.js  7.4 KB    186 lines
provider.js         15.0 KB    480 lines
chat.js              9.7 KB    361 lines
project.js           5.1 KB    198 lines
example.html        17.0 KB    393 lines
─────────────────────────────────────────
Total               59.4 KB  1,766 lines
```

## 🎯 File Loading Order

```html
<!-- MUST be in this order! -->
<script src="./db.js"></script>
<script src="./providers-config.js"></script>
<script src="./provider.js"></script>
<script src="./chat.js"></script>
<script src="./project.js"></script>
```

## 🌐 Deploy to GitHub Pages

```bash
# 1. Create repo on GitHub
# 2. Clone locally
git clone https://github.com/username/repo.git

# 3. Add files
cp *.js *.html repo/

# 4. Commit and push
cd repo
git add .
git commit -m "Add AI chat"
git push

# 5. Enable Pages
# Settings → Pages → Source: main → Save

# 6. Visit
# https://username.github.io/repo/
```

## 💡 Tips

✅ **Use Groq for testing** - It's free and VERY fast
✅ **Enable 2-3 providers** - Compare responses
✅ **Check browser console** - Errors show there
✅ **IndexedDB persists** - Data saved between sessions
✅ **Works offline** - Once loaded, UI works (API needs internet)

## 🎓 Learning Path

```
Day 1: Get it running locally
Day 2: Deploy to GitHub Pages
Day 3: Add API keys, test providers
Day 4: Customize UI
Day 5: Add custom provider
Day 6: Integrate with your code
Day 7: Ship it! 🚀
```

## 📚 Documentation

- **Quick Start:** QUICKSTART.md
- **Full Docs:** README.md
- **Overview:** SUMMARY.md
- **Structure:** FILE_STRUCTURE.md
- **Index:** INDEX.md
- **This card:** QUICK_REFERENCE.md

## 🎉 Success Checklist

- [ ] All files uploaded
- [ ] Server running (local or GitHub Pages)
- [ ] Page loads without errors
- [ ] At least one provider enabled
- [ ] API key entered
- [ ] Model selected
- [ ] Test message sent
- [ ] Response received
- [ ] 🎊 Celebrate!

---

**Need help?** Check browser console (F12)
**Want more?** Read full README.md
**Ready to ship?** Deploy to GitHub Pages!

Made with ❤️ for multi-provider AI chat
