import { getMessagingClient } from './firebase';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';

export class NotificationService {
  private messaging: any = null;
  private vapidKey: string | undefined;

  constructor() {
    // VAPID key should be set in environment variables
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  }

  /**
   * Initialize Firebase messaging
   */
  async initialize(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        console.warn('NotificationService: Not in browser environment');
        return;
      }

      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      this.messaging = await getMessagingClient();
      
      // Register service worker
      await this.registerServiceWorker();
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      throw error;
    }
  }

  /**
   * Register the Firebase messaging service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered successfully:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        await this.initialize();
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      // Get FCM token
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });

      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Listen for foreground messages
   */
  onForegroundMessage(callback: (payload: MessagePayload) => void): void {
    if (!this.messaging) {
      console.error('Messaging not initialized');
      return;
    }

    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  }

  /**
   * Send local notification (for testing or immediate notifications)
   */
  sendLocalNotification(title: string, options?: NotificationOptions): Notification | null {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
    } else {
      console.warn('Notification permission not granted');
      return null;
    }
  }

  /**
   * Check if notifications are supported and permitted
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'Notification' in window
    );
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();