import axios from 'axios';

// Mock API client
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

// Mock successful responses
export const mockApiResponses = {
  chatSessions: {
    data: {
      sessions: [],
      sessionId: 'test-session-123',
      message: 'Success',
    },
  },
  chatMessage: {
    data: {
      response: 'Mock AI response',
      sessionId: 'test-session-123',
    },
  },
  learningRecords: {
    data: {
      records: [],
      summary: 'Mock learning summary',
    },
  },
};

// Setup default mock implementations
beforeEach(() => {
  mockApiClient.get.mockResolvedValue(mockApiResponses.chatSessions);
  mockApiClient.post.mockResolvedValue(mockApiResponses.chatMessage);
});