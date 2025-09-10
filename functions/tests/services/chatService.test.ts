// Mock the LLM factory first
const mockLLMFactory = {
  getLLMProvider: jest.fn().mockReturnValue({
    generateResponse: jest.fn().mockResolvedValue('Mock AI response'),
  }),
};

jest.mock('../../src/services/llm/llmFactory', () => mockLLMFactory);

import { ChatService } from '../../src/services/chatService';
import { createTestChatSession } from '../setup/mocks/firestore';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: jest.fn().mockReturnValue({
      add: jest.fn().mockResolvedValue({ id: 'test-session-123' }),
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => createTestChatSession(),
        }),
        set: jest.fn(),
        update: jest.fn(),
      }),
    }),
  }),
}));

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
    jest.clearAllMocks();
    
    // Reset and setup LLM mock
    const mockProvider = mockLLMFactory.getLLMProvider();
    if (mockProvider && mockProvider.generateResponse) {
      mockProvider.generateResponse.mockResolvedValue('Mock AI response');
    }
  });

  describe('createSession', () => {
    it('should create a new chat session with default title', async () => {
      const sessionId = await chatService.createSession('test-user');

      expect(sessionId).toBe('test-session-123');
      expect(typeof sessionId).toBe('string');
    });

    it('should create a new chat session with custom title', async () => {
      const sessionId = await chatService.createSession('test-user', 'Custom Title');

      expect(sessionId).toBe('test-session-123');
    });

    it('should handle errors when creating session', async () => {
      // Mock the error case
      const mockAdd = jest.fn().mockRejectedValue(new Error('Firestore error'));
      const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
      
      // We need to mock the admin again to override the collection method
      jest.doMock('firebase-admin', () => ({
        apps: [],
        initializeApp: jest.fn(),
        firestore: () => ({ collection: mockCollection }),
      }));

      await expect(chatService.createSession('test-user')).rejects.toThrow();
    });
  });

  describe('sendMessage', () => {
    const mockSessionId = 'test-session-123';
    const mockUserId = 'test-user';

    it('should send message and get AI response', async () => {
      const response = await chatService.sendMessage(
        mockSessionId,
        mockUserId,
        'Hello, AI!'
      );

      expect(response).toBe('Mock AI response');
      expect(mockLLMFactory.getLLMProvider().generateResponse).toHaveBeenCalledWith(
        [],
        'Hello, AI!'
      );
    });

    it('should handle session not found error', async () => {
      // Mock non-existent session
      const mockGet = jest.fn().mockResolvedValue({ exists: false });
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
      const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
      
      jest.doMock('firebase-admin', () => ({
        apps: [],
        initializeApp: jest.fn(),
        firestore: () => ({ collection: mockCollection }),
      }));

      await expect(
        chatService.sendMessage('nonexistent', mockUserId, 'Hello')
      ).rejects.toThrow('チャットセッションが見つかりません');
    });
  });

  describe('getSession', () => {
    it('should retrieve a chat session', async () => {
      const session = await chatService.getSession('test-session-123', 'test-user');

      expect(session).toBeDefined();
      expect(session?.id).toBe('test-session-123');
    });
  });

  describe('getUserSessions', () => {
    it('should retrieve user sessions', async () => {
      // This test would need more complex mocking for Firestore queries
      // For now, we'll just ensure the method exists and can be called
      expect(chatService.getUserSessions).toBeDefined();
      expect(typeof chatService.getUserSessions).toBe('function');
    });
  });
});