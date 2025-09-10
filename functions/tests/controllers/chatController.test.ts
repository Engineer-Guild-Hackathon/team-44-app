import { Request, Response } from 'express';
import { createSession, postMessage, setChatServiceForTesting, resetChatServiceForTesting } from '../../src/controllers/chatController';

// Mock Firebase Admin first
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-123' }),
  })),
}));

// Mock LLM Factory
jest.mock('../../src/services/llm/llmFactory', () => ({
  getLLMProvider: jest.fn().mockReturnValue({
    generateResponse: jest.fn().mockResolvedValue('Mock AI response'),
  }),
}));

// Mock ChatService
jest.mock('../../src/services/chatService', () => ({
  ChatService: jest.fn().mockImplementation(() => ({
    createSession: jest.fn(),
    sendMessage: jest.fn(),
    getSession: jest.fn(),
    getUserSessions: jest.fn(),
  })),
}));

import { ChatService } from '../../src/services/chatService';

describe('ChatController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockChatService: jest.Mocked<ChatService>;

  beforeEach(() => {
    // Reset environment variables
    process.env.SKIP_AUTH = 'true'; // Skip auth for all tests
    process.env.LOCAL_USER_ID = 'test-user-123';
    process.env.USE_LOCAL_FIRESTORE_MOCK = 'true';
    process.env.USE_TEST_LLM_MOCK = 'true';
    process.env.LLM_PROVIDER = 'gemini';

    mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Create a fresh mock instance
    mockChatService = new ChatService() as jest.Mocked<ChatService>;
    
    // Set the mock ChatService for testing
    setChatServiceForTesting(mockChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset ChatService for testing
    resetChatServiceForTesting();
  });

  describe('createSession', () => {
    it('should create session successfully with valid auth', async () => {
      mockRequest.body = { title: 'Test Session' };
      mockChatService.createSession.mockResolvedValue('session-123');

      await createSession(mockRequest as Request, mockResponse as Response);

      expect(mockChatService.createSession).toHaveBeenCalledWith('test-user-123', 'Test Session');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        sessionId: 'session-123',
        message: 'チャットセッションが作成されました',
      });
    });

    it('should create session with default title when none provided', async () => {
      mockRequest.body = {};
      mockChatService.createSession.mockResolvedValue('session-123');

      await createSession(mockRequest as Request, mockResponse as Response);

      expect(mockChatService.createSession).toHaveBeenCalledWith('test-user-123', undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should handle authentication error', async () => {
      mockRequest.headers = {}; // No authorization header

      await createSession(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: '認証トークンが必要です',
      });
    });

    it('should handle service error', async () => {
      mockRequest.body = { title: 'Test Session' };
      mockChatService.createSession.mockRejectedValue(new Error('Service error'));

      await createSession(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Service error',
      });
    });

    it('should skip auth in local development mode', async () => {
      process.env.SKIP_AUTH = 'true';
      process.env.LOCAL_USER_ID = 'local-user-123';
      mockRequest.headers = {}; // No auth header
      mockRequest.body = { title: 'Local Test' };
      mockChatService.createSession.mockResolvedValue('local-session-123');

      await createSession(mockRequest as Request, mockResponse as Response);

      expect(mockChatService.createSession).toHaveBeenCalledWith('local-user-123', 'Local Test');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('postMessage', () => {
    it('should send message successfully', async () => {
      mockRequest.params = { sessionId: 'session-123' };
      mockRequest.body = { message: 'Hello AI' };
      mockChatService.sendMessage.mockResolvedValue('AI response');

      await postMessage(mockRequest as Request, mockResponse as Response);

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'session-123',
        'test-user-123',
        'Hello AI'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        response: 'AI response',
        sessionId: 'session-123',
      });
    });

    it('should handle missing message in request body', async () => {
      mockRequest.params = { sessionId: 'session-123' };
      mockRequest.body = {}; // No message

      await postMessage(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'メッセージが必要です',
      });
    });

    it('should handle service error when sending message', async () => {
      mockRequest.params = { sessionId: 'session-123' };
      mockRequest.body = { message: 'Hello AI' };
      mockChatService.sendMessage.mockRejectedValue(new Error('Session not found'));

      await postMessage(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Session not found',
      });
    });
  });
});