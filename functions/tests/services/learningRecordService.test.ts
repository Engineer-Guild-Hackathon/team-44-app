// @ts-nocheck
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Create mock firestore instance first
const mockFirestoreInstance = {
  collection: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: "test-record-123" }),
    doc: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "test-record-123",
        data: () => ({
          userId: "test-user",
          subject: "数学",
          topic: "二次関数",
          status: "active",
          lastStudiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }),
      }),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
    })),
    where: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({
        docs: [{
          id: "test-record-123",
          data: () => ({
            userId: "test-user",
            subject: "数学",
            topic: "二次関数",
            status: "active",
            lastStudiedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }]
      })
    }))
  })),
  runTransaction: jest.fn((callback) => callback({
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        userId: "test-user",
        title: "Test Session",
        status: "active",
        messages: [{ role: "user", parts: [{ text: "二次関数の解き方を教えて" }] }],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
  }))
};

// Mock Firebase Admin first
jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: jest.fn(() => mockFirestoreInstance)
}));

// Mock LLM factory
const mockLLM = {
  generateResponse: jest.fn().mockResolvedValue('{"subject": "数学", "topic": "二次関数", "confidence": 0.8}')
};

const mockGetLLMProvider = jest.fn(() => mockLLM);

jest.mock("../../src/services/llm/llmFactory", () => ({
  getLLMProvider: mockGetLLMProvider
}));

import { LearningRecordService } from '../../src/services/learningRecordService';

describe('LearningRecordService', () => {
  let service: LearningRecordService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLLMProvider.mockReturnValue(mockLLM);
    mockLLM.generateResponse.mockResolvedValue('{"subject": "数学", "topic": "二次関数", "confidence": 0.8}');
    service = new LearningRecordService();
  });

  it('should estimate subject and topic from initial message', async () => {
    const initialMessage = "二次関数の解き方を教えて";
    const result = await service.estimateSubjectAndTopic(initialMessage);

    expect(result).toEqual({
      subject: "数学",
      topic: "二次関数",
      confidence: 0.8
    });
  });

  it('should handle LLM error gracefully', async () => {
    // Mock error for this test
    mockLLM.generateResponse.mockRejectedValueOnce(new Error('LLM Error'));

    const result = await service.estimateSubjectAndTopic("test message");

    expect(result).toEqual({
      subject: "一般学習",
      topic: "AI対話",
      confidence: 0.3
    });
  });
});
