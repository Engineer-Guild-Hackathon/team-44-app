import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
// Mock Firebase auth methods
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

// Mock auth object
const mockAuth = {
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
};

// Mock the firebase client
jest.mock('../../lib/firebase', () => ({
  getAuthClient: jest.fn().mockReturnValue(mockAuth),
}));

beforeEach(() => {
  mockAuth.signInWithEmailAndPassword = mockSignInWithEmailAndPassword;
  mockAuth.createUserWithEmailAndPassword = mockCreateUserWithEmailAndPassword;
  mockAuth.signOut = mockSignOut;
  mockAuth.onAuthStateChanged = mockOnAuthStateChanged;
  
  // Reset all mocks
  jest.clearAllMocks();
});

describe('useAuth', () => {
  it('should initialize with loading state', () => {
    // Mock onAuthStateChanged to not call the callback immediately
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should update user state when auth state changes', async () => {
    const mockUser = {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    // Mock onAuthStateChanged to call callback with user
    mockOnAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return () => {}; // unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('should handle user sign out', async () => {
    // Initially no user
    mockOnAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return () => {};
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle sign in success', async () => {
    const mockUser = {
      uid: 'test-user-123',
      email: 'test@example.com',
    };

    const mockUserCredential = {
      user: mockUser,
    };

    mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'test@example.com',
      'password123'
    );
  });

  it('should handle sign in error', async () => {
    const signInError = {
      code: 'auth/user-not-found',
      message: 'User not found',
    };

    mockSignInWithEmailAndPassword.mockRejectedValue(signInError);
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'wrongpassword');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('ユーザーが見つかりません');
  });

  it('should handle sign up success', async () => {
    const mockUser = {
      uid: 'new-user-123',
      email: 'new@example.com',
    };

    const mockUserCredential = {
      user: mockUser,
    };

    mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp('new@example.com', 'password123');
    });

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'new@example.com',
      'password123'
    );
  });

  it('should handle sign up error', async () => {
    const signUpError = {
      code: 'auth/email-already-in-use',
      message: 'Email already in use',
    };

    mockCreateUserWithEmailAndPassword.mockRejectedValue(signUpError);
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.signUp('existing@example.com', 'password123');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('このメールアドレスは既に使用されています');
  });

  it('should handle logout', async () => {
    mockSignOut.mockResolvedValue(undefined);
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
  });

  it('should handle logout error', async () => {
    const signOutError = new Error('Sign out failed');
    mockSignOut.mockRejectedValue(signOutError);
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.logout();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Sign out failed');
  });

  it('should unsubscribe from auth state changes on unmount', () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should handle invalid email error', async () => {
    const invalidEmailError = {
      code: 'auth/invalid-email',
      message: 'Invalid email',
    };

    mockSignInWithEmailAndPassword.mockRejectedValue(invalidEmailError);
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.signIn('invalid-email', 'password123');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('メールアドレスの形式が正しくありません');
  });

  it('should handle weak password error', async () => {
    const weakPasswordError = {
      code: 'auth/weak-password',
      message: 'Weak password',
    };

    mockCreateUserWithEmailAndPassword.mockRejectedValue(weakPasswordError);
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.signUp('test@example.com', '123');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('パスワードは6文字以上で入力してください');
  });
});