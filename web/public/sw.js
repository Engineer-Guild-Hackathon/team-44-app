// Service Worker for Libraria PWA
const CACHE_NAME = 'libraria-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/auth',
  '/chat',
  '/calendar',
  '/reminders',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.log('Service Worker: Cache installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Push notification handling (for future implementation)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.data,
      actions: [
        { action: 'review', title: '復習する' },
        { action: 'later', title: '後で' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'review') {
    event.waitUntil(
      clients.openWindow('/chat')
    );
  } else if (event.action === 'later') {
    // Handle "later" action - could set a reminder
    console.log('User chose to review later');
  } else {
    // Default click - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});