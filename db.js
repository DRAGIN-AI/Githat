/**
 * Database Manager for IndexedDB
 * Handles all database operations for the AI Chat application
 */
class DatabaseManager {
    constructor() {
        this.dbName = 'AIChat';
        this.version = 2;
        this.db = null;
    }

    /**
     * Initialize the database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('providers')) {
                    const providerStore = db.createObjectStore('providers', { keyPath: 'id' });
                    providerStore.createIndex('name', 'name', { unique: false });
                    providerStore.createIndex('enabled', 'enabled', { unique: false });
                }

                if (!db.objectStoreNames.contains('chats')) {
                    const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
                    chatStore.createIndex('projectId', 'projectId', { unique: false });
                    chatStore.createIndex('createdAt', 'createdAt', { unique: false });
                    chatStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('projects')) {
                    const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
                    projectStore.createIndex('name', 'name', { unique: false });
                    projectStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Generic method to get all items from a store
     */
    async getAll(storeName) {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic method to get an item by ID
     */
    async get(storeName, id) {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic method to add or update an item
     */
    async put(storeName, item) {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(item);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic method to delete an item
     */
    async delete(storeName, id) {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get items by index
     */
    async getByIndex(storeName, indexName, value) {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get a setting value
     */
    async getSetting(key, defaultValue = null) {
        const setting = await this.get('settings', key);
        return setting ? setting.value : defaultValue;
    }

    /**
     * Set a setting value
     */
    async setSetting(key, value) {
        return this.put('settings', { key, value });
    }

    /**
     * Clear all data from a store
     */
    async clearStore(storeName) {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
