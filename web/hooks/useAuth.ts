import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { getAuthClient } from '../lib/firebase';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    (async () => {
      if (typeof window === 'undefined') {
        if (mounted) setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }
      try {
        const auth = await getAuthClient();
        const { onAuthStateChanged } = await import('firebase/auth');
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!mounted) return;
          setAuthState({ user, loading: false, error: null });
        });
      } catch (e) {
        if (mounted) setAuthState(prev => ({ ...prev, loading: false, error: e instanceof Error ? e.message : String(e) }));
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
  setAuthState(prev => ({ ...prev, loading: true, error: null }));
  const auth = await getAuthClient();
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'ログインに失敗しました'
      }));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
  setAuthState(prev => ({ ...prev, loading: true, error: null }));
  const auth = await getAuthClient();
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'アカウント作成に失敗しました'
      }));
    }
  };

  const logout = async () => {
    try {
  const auth = await getAuthClient();
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'ログアウトに失敗しました'
      }));
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    signIn,
    signUp,
    logout,
    clearError
  };
};
