// Simple test setup without Firebase emulator dependency for initial testing

// Mock Firebase Admin BEFORE any imports
jest.mock('firebase-admin', () => ({
  apps: { length: 0 },
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn().mockResolvedValue({ id: 'test-id' }),
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ test: 'data' }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      })),
    })),
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user' }),
  })),
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Setup test timeouts
jest.setTimeout(30000);