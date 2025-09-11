// @ts-nocheck
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Create mock firestore instance first
const mockFirestoreInstance = {
  collection: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: "test-session-123" }),
    doc: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "test-session-123",
        data: () => ({
          userId: "test-user",
          title: "Test Session",
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: []
        }),
      }),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
    })),
    where: jest.fn().mockImplementation(() => ({
      orderBy: jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue({
          docs: [{
            id: "test-session-123",
            data: () => ({
              userId: "test-user",
              title: "Test Session",
              createdAt: new Date(),
              updatedAt: new Date(),
              messages: []
            })
          }]
        })
      }))
    }))
  })),
};

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: jest.fn(() => mockFirestoreInstance),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: "test-user" }),
  })),
}));

import { ChatService } from '../../src/services/chatService';

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
    // Override the db property with our mock
    (chatService as any).db = mockFirestoreInstance;

    // Reset all mocks
    jest.clearAllMocks();

    // Reset mock implementations to default behavior
    mockFirestoreInstance.collection.mockImplementation(() => ({
      add: jest.fn().mockResolvedValue({ id: "test-session-123" }),
      doc: jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: "test-session-123",
          data: () => ({
            userId: "test-user",
            title: "Test Session",
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: []
          }),
        }),
        set: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      })),
      where: jest.fn().mockImplementation(() => ({
        orderBy: jest.fn().mockImplementation(() => ({
          get: jest.fn().mockResolvedValue({
            docs: [{
              id: "test-session-123",
              data: () => ({
                userId: "test-user",
                title: "Test Session",
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: []
              })
            }]
          })
        }))
      }))
    }));

    // Enable test mode for LLM provider
    process.env.USE_TEST_LLM_MOCK = 'true';
  });

  describe('createSession', () => {
    it('should create a new chat session with default title', async () => {
      const sessionId = await chatService.createSession('test-user');

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toBe('test-session-123'); // Firestore document ID
    });

    it('should create a new chat session with custom title', async () => {
      const sessionId = await chatService.createSession('test-user', 'Custom Title');

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toBe('test-session-123'); // Firestore document ID
    });

    it('should handle errors when creating session', async () => {
      // Create a new mock that throws an error
      const errorMockInstance = {
        collection: jest.fn().mockImplementation(() => ({
          add: jest.fn().mockRejectedValue(new Error('Firestore error')),
        })),
      };

      // Replace the db instance with error mock
      (chatService as any).db = errorMockInstance;

      await expect(
        chatService.createSession('test-user')
      ).rejects.toThrow('チャットセッションの作成に失敗しました');
    });
  });

  describe('sendMessage', () => {
    const mockUserId = 'test-user';

    it('should send message and get AI response', async () => {
      // First create a session
      const sessionId = await chatService.createSession(mockUserId);

      const response = await chatService.sendMessage(
        sessionId,
        mockUserId,
        'Hello, AI!'
      );

      expect(response).toBe('Mock AI response for testing');
    });

    it('should handle session not found error', async () => {
      // Create a mock that returns session not found
      const notFoundMockInstance = {
        collection: jest.fn().mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockResolvedValue({
              exists: false,
            }),
          })),
        })),
      };

      // Replace the db instance
      (chatService as any).db = notFoundMockInstance;

      await expect(
        chatService.sendMessage('non-existent-session', 'test-user', 'Hello')
      ).rejects.toThrow('チャットセッションが見つかりません');
    });
  });

  describe('getSession', () => {
    it('should retrieve a chat session', async () => {
      // First create a session
      const sessionId = await chatService.createSession('test-user');

      const session = await chatService.getSession(sessionId, 'test-user');

      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.userId).toBe('test-user');
    });

    it('should return null for non-existent session', async () => {
      // Create a mock that returns session not found
      const notFoundMockInstance = {
        collection: jest.fn().mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockResolvedValue({
              exists: false,
            }),
          })),
        })),
      };

      // Replace the db instance
      (chatService as any).db = notFoundMockInstance;

      const session = await chatService.getSession('non-existent', 'test-user');
      expect(session).toBeNull();
    });

    it('should handle unauthorized access', async () => {
      // Create a mock that returns a session with different userId
      const unauthorizedMockInstance = {
        collection: jest.fn().mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: "test-session-123",
              data: () => ({
                userId: "test-user", // Different from requested user
                title: "Test Session",
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: []
              }),
            }),
          })),
        })),
      };

      // Replace the db instance
      (chatService as any).db = unauthorizedMockInstance;

      await expect(
        chatService.getSession('test-session-123', 'different-user')
      ).rejects.toThrow('このセッションにアクセスする権限がありません');
    });
  });

  describe('getUserSessions', () => {
    it('should retrieve user sessions', async () => {
      // Create a session first
      await chatService.createSession('test-user');

      const sessions = await chatService.getUserSessions('test-user');

      expect(sessions).toBeDefined();
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].userId).toBe('test-user');
    });
  });

  describe('cleanup functionality', () => {
    it('should clean up old draft sessions', async () => {
      // Create mock instances for cleanup tests
      const mockDocs = [
        { ref: { delete: jest.fn() }, id: 'old-draft-1' },
        { ref: { delete: jest.fn() }, id: 'old-draft-2' }
      ];

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };

      const cleanupMockInstance = {
        collection: jest.fn().mockImplementation(() => ({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false,
            size: 2,
            docs: mockDocs
          })
        })),
        batch: jest.fn().mockReturnValue(mockBatch)
      };

      // Replace the db instance
      (chatService as any).db = cleanupMockInstance;

      const deletedCount = await chatService.cleanupOldDraftSessions(24);

      expect(deletedCount).toBe(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should return 0 when no old draft sessions exist', async () => {
      const cleanupMockInstance = {
        collection: jest.fn().mockImplementation(() => ({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: true,
            size: 0,
            docs: []
          })
        }))
      };

      // Replace the db instance
      (chatService as any).db = cleanupMockInstance;

      const deletedCount = await chatService.cleanupOldDraftSessions(24);

      expect(deletedCount).toBe(0);
    });

    it('should clean up user-specific old draft sessions', async () => {
      const mockDocs = [
        { ref: { delete: jest.fn() }, id: 'user-old-draft-1' }
      ];

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };

      const userCleanupMockInstance = {
        collection: jest.fn().mockImplementation(() => ({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false,
            size: 1,
            docs: mockDocs
          })
        })),
        batch: jest.fn().mockReturnValue(mockBatch)
      };

      // Replace the db instance
      (chatService as any).db = userCleanupMockInstance;

      const deletedCount = await chatService.cleanupUserOldDraftSessions('test-user', 24);

      expect(deletedCount).toBe(1);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      const errorMockInstance = {
        collection: jest.fn().mockImplementation(() => ({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockRejectedValue(new Error('Firestore error'))
        }))
      };

      // Replace the db instance
      (chatService as any).db = errorMockInstance;

      await expect(
        chatService.cleanupOldDraftSessions(24)
      ).rejects.toThrow('古いセッションの削除に失敗しました');
    });
  });
});
