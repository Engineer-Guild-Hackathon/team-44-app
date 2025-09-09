import { initializeApp, getApps, FirebaseApp } from "firebase/app";

let app: FirebaseApp | undefined;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function ensureApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return app;
}

// クライアント専用に Auth/Firestore を遅延取得するユーティリティ
export async function getAuthClient() {
  if (typeof window === 'undefined') {
    throw new Error('getAuthClient must be called in a browser environment');
  }
  const a = ensureApp();
  const mod = await import('firebase/auth');
  return mod.getAuth(a);
}

export async function getFirestoreClient() {
  if (typeof window === 'undefined') {
    throw new Error('getFirestoreClient must be called in a browser environment');
  }
  const a = ensureApp();
  const mod = await import('firebase/firestore');
  return mod.getFirestore(a);
}

// 互換性のために同期的に app をエクスポート（初期化は行わない）
export { app as default };
