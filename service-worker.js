/*
    service-worker.js
    
    This is the "brain" of your application.
    It will handle:
    - Caching the app shell (offline use)
    - Intercepting API requests (potential caching)
    - Handling all IndexedDB operations
    - Performing GitHub API calls
    - Broadcasting state changes to all tabs
*/

const CACHE_NAME = 'github-pro-cache-v1';
const APP_SHELL_URLS = [
    './github-pro-complete.html',
    // Add other core assets here if you split them (e.g., css, main.js)
];

// Use a BroadcastChannel for multi-tab sync
const syncChannel = new BroadcastChannel('github_pro_sync');

let db; // Database instance

// --- Install & Activate ---

self.addEventListener('install', event => {
    console.log('[SW] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// --- Caching Strategy ---

self.addEventListener('fetch', event => {
    // For app shell files, use cache-first
    const url = new URL(event.request.url);
    if (APP_SHELL_URLS.includes(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
    // For API calls, use network-first (or just fetch)
    // We don't want to cache GitHub API calls
});


// --- Main Message Handler ---

self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    const { type, payload } = event.data;

    // Ensure DB is open before handling messages
    initDB().then(() => {
        switch (type) {
            case 'CLONE_REPO':
                handleCloneRepo(payload);
                break;
            case 'COMMIT_FILES':
                handleCommitFiles(payload);
                break;
            // Add other handlers:
            // case 'GET_FILE_TREE': ...
            // case 'SAVE_FILE': ...
            // case 'GET_DIRTY_FILES': ...
        }
    }).catch(err => console.error('[SW] DB Error:', err));
});

// --- Broadcast Utility ---
function broadcastUpdate(message) {
    syncChannel.postMessage(message);
}


// --- Database Logic (MOVED FROM MAIN PAGE) ---

function initDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        
        // TODO: Add repo/branch scoping to schema
        const request = indexedDB.open('GitHubProDB', 2); 
        
        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('[SW] Database initialized');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                const fileStore = db.createObjectStore('files', { keyPath: 'path' }); // TODO: keyPath: ['repo', 'branch', 'path']
                fileStore.createIndex('isDirty', 'isDirty', { unique: false });
            }
            if (!db.objectStoreNames.contains('metadata')) {
                db.createObjectStore('metadata', { keyPath: 'key' }); // TODO: keyPath: ['repo', 'key']
            }
        };
    });
}

// TODO: Create promisified DB helpers (save, get, getAll, etc.)
// e.g., async function saveToDB(storeName, data) { ... }


// --- Business Logic (Skeletons) ---

async function handleCloneRepo(repoConfig) {
    console.log('[SW] Cloning repo:', repoConfig.owner, repoConfig.repo);
    
    // 1. Get headers (need to get token from payload or IDB)
    // 2. Fetch tree
    // 3. Loop and fetch all file contents
    // 4. Save all files to IndexedDB
    // 5. Save metadata
    
    // After completion:
    broadcastUpdate({ type: 'CLONE_COMPLETE' });
    
    // On progress:
    // broadcastUpdate({ type: 'CLONE_PROGRESS', payload: { ... } });
}

async function handleCommitFiles(commitData) {
    console.log('[SW] Committing files:', commitData.message);
    
    // 1. Get auth token
    // 2. Get all file data from commitData.files
    // 3. **Perform Git Data API sequence**
    //    - Get base ref & tree
    //    - Create blobs
    //    - Create tree
    //    - Create commit
    //    - Update ref
    // 4. On success, update all `isDirty` and `sha` fields in IndexedDB
    
    // After completion:
    broadcastUpdate({ type: 'COMMIT_COMPLETE' });
}