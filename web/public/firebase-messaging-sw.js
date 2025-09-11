// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration will be dynamically loaded
// This is a placeholder that will be replaced by environment-specific config
const firebaseConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder.firebaseapp.com",
  projectId: "placeholder",
  storageBucket: "placeholder.appspot.com",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || '学習リマインド';
  const notificationOptions = {
    body: payload.notification?.body || '復習の時間です',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: payload.data,
    actions: [
      { action: 'review', title: '復習する' },
      { action: 'later', title: '後で' }
    ],
    tag: 'learning-reminder',
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Handle action buttons
  if (event.action === 'review') {
    // Open the app to the learning page
    event.waitUntil(
      clients.openWindow('/?action=review&id=' + (event.notification.data?.recordId || ''))
    );
  } else if (event.action === 'later') {
    // Schedule another reminder (this could trigger an API call)
    console.log('User chose to review later');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle push events (for custom notifications)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('[firebase-messaging-sw.js] Push event received:', data);

    const notificationTitle = data.title || '学習リマインド';
    const notificationOptions = {
      body: data.body || '復習の時間です',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.data,
      actions: [
        { action: 'review', title: '復習する' },
        { action: 'later', title: '後で' }
      ],
      tag: 'learning-reminder',
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  }
});