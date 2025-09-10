// Mock Firebase auth
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

// Mock Firebase firestore
export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
};

// Mock Firebase config
export const mockFirebaseConfig = {
  apiKey: 'mock-api-key',
  authDomain: 'mock-auth-domain',
  projectId: 'mock-project-id',
  storageBucket: 'mock-storage-bucket',
  messagingSenderId: 'mock-sender-id',
  appId: 'mock-app-id',
};