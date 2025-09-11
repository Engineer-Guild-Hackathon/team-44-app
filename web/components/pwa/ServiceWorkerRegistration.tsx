'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
          });
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      };

      // Register immediately or on load
      if (document.readyState === 'loading') {
        window.addEventListener('load', registerSW);
      } else {
        registerSW();
      }

      return () => {
        window.removeEventListener('load', registerSW);
      };
    }
  }, []);

  return null;
}