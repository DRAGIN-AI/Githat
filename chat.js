/**
 * Chat Class
 * Manages individual chat conversations
 */
class Chat {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || 'New Chat';
        this.messages = data.messages || [];
        this.projectId = data.projectId || null;
        this.systemPrompt = data.systemPrompt || '';
        this.temperature = data.temperature !== undefined ? data.temperature : 0.7;
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
        this.metadata = data.metadata || {};
    }

    generateId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Add a message to the chat
     */
    addMessage(role, content, metadata = {}) {
        const message = {
            role: role, // 'user', 'assistant', 'system'
            content: content,
            timestamp: Date.now(),
            ...metadata
        };
        this.messages.push(message);
        this.updatedAt = Date.now();
        
        // Auto-generate title from first user message if still "New Chat"
        if (this.title === 'New Chat' && role === 'user' && this.messages.filter(m => m.role === 'user').length === 1) {
            this.title = this.generateTitle(content);
        }
        
        return message;
    }

    /**
     * Generate a title from message content
     */
    generateTitle(content) {
        const maxLength = 50;
        let title = content.trim();
        
        // Remove markdown formatting
        title = title.replace(/[#*_`]/g, '');
        
        // Truncate if too long
        if (title.length > maxLength) {
            title = title.substring(0, maxLength) + '...';
        }
        
        return title || 'New Chat';
    }

    /**
     * Update a message
     */
    updateMessage(timestamp, updates) {
        const message = this.messages.find(m => m.timestamp === timestamp);
        if (message) {
            Object.assign(message, updates);
            this.updatedAt = Date.now();
        }
    }

    /**
     * Delete a message
     */
    deleteMessage(timestamp) {
        this.messages = this.messages.filter(m => m.timestamp !== timestamp);
        this.updatedAt = Date.now();
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        this.messages = [];
        this.updatedAt = Date.now();
    }

    /**
     * Get messages for API request (excludes system messages or formats them)
     */
    getMessagesForAPI() {
        let messages = [...this.messages];
        
        // Add system prompt if exists
        if (this.systemPrompt) {
            messages = [
                { role: 'system', content: this.systemPrompt },
                ...messages.filter(m => m.role !== 'system')
            ];
        }
        
        return messages.map(m => ({
            role: m.role,
            content: m.content
        }));
    }

    /**
     * Export chat to different formats
     */
    export(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.toJSON(), null, 2);
            
            case 'markdown':
                let md = `# ${this.title}\n\n`;
                md += `Created: ${new Date(this.createdAt).toLocaleString()}\n`;
                md += `Updated: ${new Date(this.updatedAt).toLocaleString()}\n\n`;
                md += `---\n\n`;
                
                for (const msg of this.messages) {
                    if (msg.role === 'system') continue;
                    const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
                    md += `### ${role}\n\n${msg.content}\n\n`;
                }
                
                return md;
            
            case 'text':
                let text = `${this.title}\n`;
                text += `Created: ${new Date(this.createdAt).toLocaleString()}\n`;
                text += `Updated: ${new Date(this.updatedAt).toLocaleString()}\n\n`;
                text += `${'='.repeat(50)}\n\n`;
                
                for (const msg of this.messages) {
                    if (msg.role === 'system') continue;
                    const role = msg.role === 'user' ? 'User' : 'Assistant';
                    text += `${role}:\n${msg.content}\n\n${'-'.repeat(50)}\n\n`;
                }
                
                return text;
            
            default:
                return JSON.stringify(this.toJSON());
        }
    }

    /**
     * Get message count by role
     */
    getMessageCount(role = null) {
        if (role) {
            return this.messages.filter(m => m.role === role).length;
        }
        return this.messages.length;
    }

    /**
     * Get last message
     */
    getLastMessage() {
        return this.messages[this.messages.length - 1];
    }

    /**
     * Clone the chat
     */
    clone() {
        const cloned = new Chat({
            ...this.toJSON(),
            id: this.generateId(),
            title: this.title + ' (Copy)',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        return cloned;
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            messages: this.messages,
            projectId: this.projectId,
            systemPrompt: this.systemPrompt,
            temperature: this.temperature,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            metadata: this.metadata
        };
    }
}

/**
 * Chat Manager Class
 * Manages all chats
 */
class ChatManager {
    constructor(db) {
        this.db = db;
        this.chats = new Map();
        this.currentChatId = null;
    }

    /**
     * Initialize chats from database
     */
    async init() {
        const savedChats = await this.db.getAll('chats');
        
        for (const data of savedChats) {
            const chat = new Chat(data);
            this.chats.set(chat.id, chat);
        }

        // Load current chat
        this.currentChatId = await this.db.getSetting('currentChat');
        
        // If no current chat or it doesn't exist, create a new one
        if (!this.currentChatId || !this.chats.has(this.currentChatId)) {
            await this.createChat();
        }
    }

    /**
     * Create a new chat
     */
    async createChat(data = {}) {
        const chat = new Chat(data);
        this.chats.set(chat.id, chat);
        await this.db.put('chats', chat.toJSON());
        
        // Set as current chat
        this.currentChatId = chat.id;
        await this.db.setSetting('currentChat', chat.id);
        
        return chat;
    }

    /**
     * Get all chats
     */
    getAllChats() {
        return Array.from(this.chats.values())
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    /**
     * Get chats by project
     */
    getChatsByProject(projectId) {
        return Array.from(this.chats.values())
            .filter(chat => chat.projectId === projectId)
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    /**
     * Get chat by ID
     */
    getChat(id) {
        return this.chats.get(id);
    }

    /**
     * Get current chat
     */
    getCurrentChat() {
        return this.chats.get(this.currentChatId);
    }

    /**
     * Set current chat
     */
    async setCurrentChat(id) {
        if (!this.chats.has(id)) {
            throw new Error('Chat not found');
        }
        this.currentChatId = id;
        await this.db.setSetting('currentChat', id);
    }

    /**
     * Update a chat
     */
    async updateChat(id, updates) {
        const chat = this.chats.get(id);
        if (!chat) {
            throw new Error('Chat not found');
        }

        Object.assign(chat, updates);
        chat.updatedAt = Date.now();
        
        await this.db.put('chats', chat.toJSON());
        return chat;
    }

    /**
     * Delete a chat
     */
    async deleteChat(id) {
        if (!this.chats.has(id)) {
            throw new Error('Chat not found');
        }

        this.chats.delete(id);
        await this.db.delete('chats', id);

        // If this was the current chat, create a new one
        if (this.currentChatId === id) {
            const remainingChats = this.getAllChats();
            if (remainingChats.length > 0) {
                await this.setCurrentChat(remainingChats[0].id);
            } else {
                await this.createChat();
            }
        }
    }

    /**
     * Search chats
     */
    searchChats(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllChats().filter(chat => {
            // Search in title
            if (chat.title.toLowerCase().includes(lowerQuery)) {
                return true;
            }
            // Search in messages
            return chat.messages.some(msg => 
                msg.content.toLowerCase().includes(lowerQuery)
            );
        });
    }

    /**
     * Get chat statistics
     */
    getStatistics() {
        const chats = this.getAllChats();
        const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
        const userMessages = chats.reduce((sum, chat) => 
            sum + chat.messages.filter(m => m.role === 'user').length, 0);
        const assistantMessages = chats.reduce((sum, chat) => 
            sum + chat.messages.filter(m => m.role === 'assistant').length, 0);

        return {
            totalChats: chats.length,
            totalMessages,
            userMessages,
            assistantMessages,
            oldestChat: chats.length > 0 ? Math.min(...chats.map(c => c.createdAt)) : null,
            newestChat: chats.length > 0 ? Math.max(...chats.map(c => c.createdAt)) : null
        };
    }
}
