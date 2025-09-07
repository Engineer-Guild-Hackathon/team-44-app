import { create } from 'zustand';
import { ChatMessage, ChatSession } from '../types/api';

interface ChatState {
  // 現在のセッション
  currentSession: ChatSession | null;

  // セッション一覧
  sessions: ChatSession[];

  // ローディング状態
  isLoading: boolean;

  // エラー状態
  error: string | null;

  // アクション
  setCurrentSession: (session: ChatSession | null) => void;
  setSessions: (sessions: ChatSession[]) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // セッションを追加
  addSession: (session: ChatSession) => void;

  // セッションを更新
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentSession: null,
  sessions: [],
  isLoading: false,
  error: null,

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  setSessions: (sessions) => {
    set({ sessions });
  },

  addMessage: (message) => {
    const { currentSession } = get();
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, message],
        updatedAt: new Date()
      };
      set({ currentSession: updatedSession });

      // セッション一覧も更新
      const { sessions } = get();
      const updatedSessions = sessions.map(session =>
        session.id === currentSession.id ? updatedSession : session
      );
      set({ sessions: updatedSessions });
    }
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  addSession: (session) => {
    const { sessions } = get();
    set({ sessions: [session, ...sessions] });
  },

  updateSession: (sessionId, updates) => {
    const { sessions, currentSession } = get();

    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    );
    set({ sessions: updatedSessions });

    if (currentSession && currentSession.id === sessionId) {
      set({ currentSession: { ...currentSession, ...updates } });
    }
  }
}));
