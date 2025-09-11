// Firebaseエラーコードを日本語メッセージに変換
const getErrorMessage = (error: any) => {
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/user-not-found':
      return 'ユーザーが見つかりません';
    case 'auth/wrong-password':
      return 'パスワードが間違っています';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で入力してください';
    default:
      return error.message || '認証に失敗しました';
  }
};
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
        error: getErrorMessage(error)
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
        error: getErrorMessage(error)
      }));
    }
  };

  const logout = async () => {
    try {
      const auth = await getAuthClient();
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      // ログアウト後に/authページにリダイレクト
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: getErrorMessage(error)
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
