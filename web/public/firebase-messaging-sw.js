// Firebase Cloud Messaging Service Worker for PWA Push Notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration will be injected at runtime from environment variables
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN", 
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
  appId: "FIREBASE_APP_ID"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages when app is not in focus
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification?.title || '学習リマインド';
  const notificationOptions = {
    body: payload.notification?.body || '復習の時間です',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: payload.data || {},
    actions: [
      { action: 'review', title: '復習する' },
      { action: 'later', title: '後で' }
    ],
    requireInteraction: true,
    tag: 'learning-reminder'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'review') {
    // Open the app to the reminders page
    event.waitUntil(
      clients.openWindow('/reminders')
    );
  } else if (event.action === 'later') {
    // Just close the notification
    console.log('User chose to review later');
  } else {
    // Default click - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});