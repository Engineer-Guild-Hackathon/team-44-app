import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';

// Reuse Firebase config from existing firebase.ts
const strip = (v?: string) => (v ?? '').trim().replace(/^['\"]+|['\"]+$/g, '');

const firebaseConfig = {
  apiKey: strip(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: strip(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: strip(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: strip(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: strip(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: strip(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

let messaging: any = null;

// Initialize Firebase Messaging
export const initializeFirebaseMessaging = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Messaging can only be initialized in browser environment');
  }

  try {
    // Initialize Firebase app if not already done
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

    // Get messaging instance
    messaging = getMessaging(app);

    // Update service worker with actual config
    await updateServiceWorkerConfig();

    return messaging;
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error);
    throw error;
  }
};

// Update service worker with real Firebase config
const updateServiceWorkerConfig = async () => {
  try {
    const response = await fetch('/firebase-messaging-sw.js');
    let swCode = await response.text();

    // Replace placeholders with actual config values
    swCode = swCode
      .replace('"FIREBASE_API_KEY"', `"${firebaseConfig.apiKey}"`)
      .replace('"FIREBASE_AUTH_DOMAIN"', `"${firebaseConfig.authDomain}"`)
      .replace('"FIREBASE_PROJECT_ID"', `"${firebaseConfig.projectId}"`)
      .replace('"FIREBASE_STORAGE_BUCKET"', `"${firebaseConfig.storageBucket}"`)
      .replace('"FIREBASE_MESSAGING_SENDER_ID"', `"${firebaseConfig.messagingSenderId}"`)
      .replace('"FIREBASE_APP_ID"', `"${firebaseConfig.appId}"`);

    // Create blob and register service worker
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);

    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register(swUrl, {
        scope: '/firebase-cloud-messaging-push-scope',
      });
    }

    URL.revokeObjectURL(swUrl);
  } catch (error) {
    console.error('Failed to update service worker config:', error);
    // Fallback: try to register the original service worker
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }
  }
};

// Get FCM registration token
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    await initializeFirebaseMessaging();
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    if (token) {
      console.log('FCM registration token:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Register FCM token with backend
export const registerFCMTokenWithBackend = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/fcm/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Auth token would be added here in real implementation
      },
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      console.log('FCM token registered with backend');
      return true;
    } else {
      console.error('Failed to register FCM token with backend:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error registering FCM token with backend:', error);
    return false;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => {};
  }

  return onMessage(messaging, callback);
};

// Check if FCM is supported
export const isFCMSupported = (): boolean => {
  return typeof window !== 'undefined' &&
         'serviceWorker' in navigator &&
         'Notification' in window &&
         'PushManager' in window;
};

// Send demo notification for testing
export const sendDemoNotification = async (): Promise<boolean> => {
  try {
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    // Create and show demo notification
    const notification = new Notification('学習リマインド - デモ通知', {
      body: 'これはデモ通知です。学習リマインド機能が正常に動作しています！',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'demo-notification',
      requireInteraction: false
    });

    // Handle notification click
    notification.onclick = () => {
      notification.close();
      // Focus the app window
      window.focus();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return true;
  } catch (error) {
    console.error('Failed to send demo notification:', error);
    throw error;
  }
};
