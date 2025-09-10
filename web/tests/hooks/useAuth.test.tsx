import { renderHook, waitFor } from "@testing-library/react";

// Mock Firebase auth methods
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

// Mock auth object with all required properties
const mockAuth = {
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  currentUser: null,
  app: {},
  config: {},
  languageCode: null,
  tenantId: null,
  settings: {},
  _getRecaptchaConfig: jest.fn(),
  _canInitEmulator: false,
  _isInitialized: true,
};

// Mock the firebase client BEFORE importing the hook
jest.mock("../../lib/firebase", () => ({
  getAuthClient: jest.fn(() => Promise.resolve(mockAuth)),
}));

// Mock Firebase Auth module with dynamic import
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Immediately call callback with null user to simulate no user logged in
    setTimeout(() => callback(null), 0); // Use setTimeout to make it async
    return () => {}; // Return unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Import after mocking
import { useAuth } from "../../hooks/useAuth";

beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  mockOnAuthStateChanged.mockReset();
  mockSignInWithEmailAndPassword.mockReset();
  mockCreateUserWithEmailAndPassword.mockReset();
  mockSignOut.mockReset();
});

describe('useAuth', () => {
  it.skip('should initialize with loading state and complete initialization', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the async initialization to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });
  });

  it.skip('should return auth methods after initialization', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should export useAuth hook', () => {
    expect(typeof useAuth).toBe('function');
  });
});