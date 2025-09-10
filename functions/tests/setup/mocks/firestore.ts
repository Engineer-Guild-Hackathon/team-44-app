// Mock Firestore admin
export const mockFirestoreAdmin = {
  collection: jest.fn(),
  doc: jest.fn(),
  batch: jest.fn(),
  runTransaction: jest.fn(),
};

// Mock Firestore document
export const mockFirestoreDoc = {
  id: 'test-doc-id',
  exists: true,
  data: jest.fn().mockReturnValue({}),
  ref: {
    path: 'test/path',
  },
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock Firestore collection
export const mockFirestoreCollection = {
  doc: jest.fn().mockReturnValue(mockFirestoreDoc),
  add: jest.fn().mockResolvedValue(mockFirestoreDoc),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({
    docs: [],
    empty: true,
    size: 0,
  }),
};

// Helper to create test data
export const createTestChatSession = (overrides: any = {}) => ({
  id: 'test-session-123',
  userId: 'test-user-123',
  title: 'Test Session',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T01:00:00Z'),
  messages: [],
  ...overrides,
});

export const createTestMessage = (overrides: any = {}) => ({
  role: 'user' as const,
  parts: [{ text: 'Test message' }],
  timestamp: new Date('2024-01-01T00:30:00Z'),
  ...overrides,
});