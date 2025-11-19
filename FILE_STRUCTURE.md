# File Structure and Relationships

## 📁 Directory Structure

```
your-github-repo/
│
├── index.html (or integration-example.html)  ← Main application file
│   └── Includes all JS files below ↓
│
├── db.js                      ← Database layer (IndexedDB)
│   └── DatabaseManager class
│
├── providers-config.js        ← Default provider configurations
│   └── DEFAULT_PROVIDERS array (10 providers)
│
├── provider.js                ← Provider management
│   ├── Provider class         (individual provider)
│   └── ProviderManager class  (manages all providers)
│
├── chat.js                    ← Chat/message management
│   ├── Chat class             (individual conversation)
│   └── ChatManager class      (manages all chats)
│
├── project.js                 ← Project/folder organization
│   ├── Project class          (individual project)
│   └── ProjectManager class   (manages all projects)
│
└── Documentation/
    ├── README.md              ← Full architecture docs
    ├── QUICKSTART.md          ← 5-minute setup guide
    ├── SUMMARY.md             ← This package overview
    └── FILE_STRUCTURE.md      ← This file
```

## 🔗 Dependency Graph

```
index.html
    │
    ├─→ db.js
    │     └─→ IndexedDB (browser)
    │
    ├─→ providers-config.js
    │     └─→ DEFAULT_PROVIDERS
    │
    ├─→ provider.js
    │     ├─→ db.js
    │     └─→ providers-config.js
    │
    ├─→ chat.js
    │     └─→ db.js
    │
    └─→ project.js
          └─→ db.js
```

## 📊 Class Relationships

```
DatabaseManager (db.js)
    ↓ used by
    ├─→ ProviderManager (provider.js)
    │       ↓ manages
    │       └─→ Provider instances
    │               ↓ uses
    │               └─→ DEFAULT_PROVIDERS (providers-config.js)
    │
    ├─→ ChatManager (chat.js)
    │       ↓ manages
    │       └─→ Chat instances
    │
    └─→ ProjectManager (project.js)
            ↓ manages
            └─→ Project instances
```

## 🗄️ IndexedDB Structure

```
Database: "AIChat" (version 2)
│
├── Object Store: "providers"
│   ├── Key: id
│   ├── Indexes: name, enabled
│   └── Data: Provider configurations + API keys
│
├── Object Store: "chats"
│   ├── Key: id
│   ├── Indexes: projectId, createdAt, updatedAt
│   └── Data: Chat messages and metadata
│
├── Object Store: "projects"
│   ├── Key: id
│   ├── Indexes: name, createdAt
│   └── Data: Project information
│
└── Object Store: "settings"
    ├── Key: key
    └── Data: App preferences
        ├── activeProvider
        ├── currentChat
        ├── currentProject
        └── selectedModel
```

## 🔄 Data Flow

### Sending a Message

```
User Input
    ↓
1. Get current chat from ChatManager
2. Add user message to chat
3. Get selected model from UI
4. Parse model → get Provider from ProviderManager
5. Get messages for API from chat
6. Provider transforms request based on format
7. Provider sends HTTP request to API
8. Provider streams response back
9. Chat receives and stores assistant message
10. ChatManager saves to IndexedDB
11. UI updates
```

### Loading the App

```
Browser loads index.html
    ↓
1. Load all JS files
2. Initialize DatabaseManager
3. Initialize ProviderManager
    ├─→ Load providers from DB
    └─→ Or create from DEFAULT_PROVIDERS
4. Initialize ChatManager
    ├─→ Load chats from DB
    └─→ Or create first chat
5. Initialize ProjectManager
    └─→ Load projects from DB
6. Render UI
    ├─→ Render provider list
    ├─→ Render model selector
    ├─→ Render current chat
    └─→ Render statistics
```

## 🎯 Key Integration Points

### In HTML (index.html)

```html
<!-- 1. Include scripts in order -->
<script src="./db.js"></script>
<script src="./providers-config.js"></script>
<script src="./provider.js"></script>
<script src="./chat.js"></script>
<script src="./project.js"></script>

<!-- 2. UI containers -->
<div id="providersList"></div>    <!-- Provider cards -->
<select id="modelSelect"></select>  <!-- Model selector -->
<div id="chatMessages"></div>      <!-- Chat messages -->
```

### In JavaScript

```javascript
// 1. Global variables
let db, providerManager, chatManager, projectManager;

// 2. Initialization
async function initializeApp() {
    db = new DatabaseManager();
    await db.init();
    
    providerManager = new ProviderManager(db);
    await providerManager.init();
    
    chatManager = new ChatManager(db);
    await chatManager.init();
    
    projectManager = new ProjectManager(db);
    await projectManager.init();
}

// 3. Using the managers
const provider = providerManager.getActiveProvider();
const chat = chatManager.getCurrentChat();
const response = await provider.sendRequest(messages, model);
```

## 🔧 File Purposes

| File | Size | Purpose | Depends On |
|------|------|---------|------------|
| db.js | 5.2KB | IndexedDB operations | IndexedDB API |
| providers-config.js | 7.4KB | Default provider configs | None |
| provider.js | 15KB | Provider management | db.js, providers-config.js |
| chat.js | 9.7KB | Chat management | db.js |
| project.js | 5.1KB | Project management | db.js |
| integration-example.html | 17KB | Working example app | All above |

## 📝 Order of Loading

**Critical:** Files must be loaded in this order:

1. **First:** db.js (needed by all managers)
2. **Second:** providers-config.js (needed by provider.js)
3. **Then:** provider.js, chat.js, project.js (in any order)
4. **Finally:** Your application code

## 🎨 UI Component Tree

```
Application
│
├── Providers Section
│   ├── Provider Cards
│   │   ├── Provider Info (name, color, model count)
│   │   ├── Enable/Disable Toggle
│   │   ├── API Key Input
│   │   └── Edit Button
│   └── Add Provider Button
│
├── Model Selector
│   └── Dropdown (all models from enabled providers)
│
├── Chat Section
│   ├── Messages Container
│   │   ├── User Messages
│   │   └── Assistant Messages
│   └── Input Area
│       ├── Text Input
│       └── Send Button
│
└── Statistics
    ├── Total Chats
    ├── Total Messages
    ├── Active Providers
    └── Available Models
```

## 🚀 Deployment Files

### Minimum required for deployment:
```
✅ db.js
✅ providers-config.js
✅ provider.js
✅ chat.js
✅ project.js
✅ index.html (or integration-example.html)
```

### Optional but recommended:
```
📄 README.md (for documentation)
📄 QUICKSTART.md (for users)
```

### Not needed for deployment:
```
❌ SUMMARY.md (development reference)
❌ FILE_STRUCTURE.md (development reference)
```

## 🔐 Sensitive Data

**Stored in IndexedDB:**
- API keys (client-side only)
- Chat history
- Provider configurations

**Never stored:**
- Server-side data (no server!)
- External databases
- Cloud storage

**Security Note:** All data stays in the user's browser.

## 📱 Platform Compatibility

| Platform | Status | Notes |
|----------|--------|-------|
| GitHub Pages | ✅ Perfect | Static hosting, no server needed |
| Netlify | ✅ Perfect | Static hosting, fast CDN |
| Vercel | ✅ Perfect | Static hosting |
| Local Server | ✅ Works | Use `python -m http.server` |
| File:// Protocol | ⚠️ Limited | CORS issues, use server instead |

## 🎓 Learning Path

1. **Start:** integration-example.html
2. **Learn:** db.js (understand storage)
3. **Explore:** provider.js (understand providers)
4. **Build:** chat.js (understand messages)
5. **Organize:** project.js (understand grouping)
6. **Customize:** providers-config.js (add models)

---

**Quick Reference:**
- Total Files: 6 JS + 1 HTML
- Total Lines: ~1,800
- Dependencies: 0 (except browser APIs)
- Server Required: No
- Build Process: No
- Deploy Time: < 10 minutes
