import { initializeApp, getApps, FirebaseApp } from "firebase/app";


let app: FirebaseApp | undefined;

// Use direct process.env.<NAME> so Next.js can inline the values at build time.
// Trim surrounding quotes if present (some env files include extra quotes).
const strip = (v?: string) => (v ?? '').trim().replace(/^['\"]+|['\"]+$/g, '');

const firebaseConfig = {
  apiKey: strip(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: strip(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: strip(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: strip(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: strip(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: strip(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

// Runtime sanity check: fail fast with a clear message if API key is missing/empty.
if (!firebaseConfig.apiKey) {
  // NEXT_PUBLIC_* keys are safe to log (public), but keep message concise.
  // This helps detect incorrect environment variable setup on hosting (Vercel).
  // eslint-disable-next-line no-console
  console.error('FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing or empty. Check your environment variables (Vercel / .env).');
}

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

export async function getMessagingClient() {
  if (typeof window === 'undefined') {
    throw new Error('getMessagingClient must be called in a browser environment');
  }
  const a = ensureApp();
  const mod = await import('firebase/messaging');
  return mod.getMessaging(a);
}

// 互換性のために同期的に app をエクスポート（初期化は行わない）
export { app as default };
