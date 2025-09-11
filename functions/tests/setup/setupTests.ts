import { jest, beforeEach } from '@jest/globals';

// Simple test setup without Firebase emulator dependency for initial testing

// Mock Firebase Admin BEFORE any imports
jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn().mockResolvedValue({ id: "test-session-123" }),
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: "test-session-123",
            userId: "test-user",
            title: "Test Session",
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: []
          }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      })),
      where: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          docs: [{
            id: "test-session-123",
            data: () => ({
              id: "test-session-123",
              userId: "test-user",
              title: "Test Session",
              createdAt: new Date(),
              updatedAt: new Date(),
              messages: []
            })
          }]
        })
      }))
    })),
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: "test-user" }),
  })),
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Setup test timeouts
jest.setTimeout(30000);
