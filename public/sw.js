// Service Worker for Push Notifications
const CACHE_NAME = 'eva-wellbeing-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  const options = {
    body: 'Новое уведомление от Eva Wellbeing',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'eva-notification',
    renotify: true,
    requireInteraction: false,
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть'
      },
      {
        action: 'dismiss',
        title: 'Закрыть'
      }
    ]
  };

  let title = 'Eva Wellbeing';

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || title;
      options.body = payload.body || options.body;
      options.icon = payload.icon || options.icon;
      options.badge = payload.badge || options.badge;
      options.data = { ...options.data, ...payload.data };
      options.actions = payload.actions || options.actions;
      options.tag = payload.data?.type || options.tag;
    } catch (error) {
      console.error('Error parsing push payload:', error);
      options.body = event.data.text() || options.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'dismiss') {
    return;
  }

  const urlToOpen = data.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync event (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle background sync if needed
  }
});

// Message event from main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});