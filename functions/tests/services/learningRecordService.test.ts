// @ts-nocheck
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock Firebase Admin first
jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn().mockResolvedValue({ id: "test-record-123" }),
      doc: jest.fn(() => ({
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
      where: jest.fn(() => ({
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
  })),
  firestore: {
    FieldValue: {
      increment: jest.fn((value) => ({ _increment: value }))
    }
  }
}));

// Mock LLM factory
jest.mock("../../src/services/llm/llmFactory", () => ({
  getLLMProvider: jest.fn(() => ({
    generateResponse: jest.fn().mockResolvedValue('{"subject": "数学", "topic": "二次関数", "confidence": 0.8}')
  }))
}));

import { LearningRecordService } from '../../src/services/learningRecordService';

describe('LearningRecordService', () => {
  let service: LearningRecordService;

  beforeEach(() => {
    jest.clearAllMocks();
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
    const mockLLM = require("../../src/services/llm/llmFactory").getLLMProvider();
    mockLLM.generateResponse.mockRejectedValueOnce(new Error('LLM Error'));

    const result = await service.estimateSubjectAndTopic("test message");

    expect(result).toEqual({
      subject: "一般学習",
      topic: "AI対話",
      confidence: 0.3
    });
  });
});
