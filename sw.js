// TASK QUEST Service Worker
const CACHE_NAME = 'task-quest-v1.0.0';
const STATIC_CACHE = 'task-quest-static-v1.0.0';
const DYNAMIC_CACHE = 'task-quest-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🎮 Task Quest Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('🎮 Task Quest Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('🎮 Task Quest Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('🎮 Task Quest Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🎮 Task Quest Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🎮 Task Quest Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('🎮 Task Quest Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('🎮 Task Quest Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        console.log('🎮 Task Quest Service Worker: Fetching from network', request.url);
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('🎮 Task Quest Service Worker: Fetch failed', error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Return a generic offline response for other requests
            return new Response('Offline - Task Quest is not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background sync for offline quest creation
self.addEventListener('sync', (event) => {
  console.log('🎮 Task Quest Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-quests') {
    event.waitUntil(
      // Sync offline quests when connection is restored
      syncOfflineQuests()
    );
  }
});

// Push notifications for deadline alerts
self.addEventListener('push', (event) => {
  console.log('🎮 Task Quest Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'You have quest deadlines approaching!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open Task Quest',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-72x72.png'
      }
    ],
    tag: 'task-quest-deadline',
    renotify: true,
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification('🎮 Task Quest - Deadline Alert!', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🎮 Task Quest Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🎮 Task Quest Service Worker: Notification closed');
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  console.log('🎮 Task Quest Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Helper function to sync offline quests
async function syncOfflineQuests() {
  try {
    // Get offline quests from IndexedDB
    const offlineQuests = await getOfflineQuests();
    
    if (offlineQuests.length > 0) {
      console.log('🎮 Task Quest Service Worker: Syncing offline quests', offlineQuests.length);
      
      // Here you would typically send the offline quests to your server
      // For now, we'll just log them
      offlineQuests.forEach(quest => {
        console.log('🎮 Task Quest Service Worker: Syncing quest', quest);
      });
      
      // Clear offline quests after successful sync
      await clearOfflineQuests();
    }
  } catch (error) {
    console.error('🎮 Task Quest Service Worker: Sync failed', error);
  }
}

// Helper function to get offline quests (placeholder)
async function getOfflineQuests() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

// Helper function to clear offline quests (placeholder)
async function clearOfflineQuests() {
  // This would typically clear from IndexedDB
  console.log('🎮 Task Quest Service Worker: Offline quests cleared');
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('🎮 Task Quest Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === 'background-sync-quests') {
    event.waitUntil(syncOfflineQuests());
  }
});

console.log('🎮 Task Quest Service Worker: Loaded successfully!');

