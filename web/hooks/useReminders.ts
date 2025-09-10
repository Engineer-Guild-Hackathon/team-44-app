import { useState, useEffect } from 'react';
import { getAuthClient } from '../lib/firebase';

interface Reminder {
  id: string;
  userId: string;
  recordId: string;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'completed';
  type: 'review' | 'practice';
  createdAt: Date;
  updatedAt: Date;
}

interface ReminderSettings {
  userId: string;
  enabled: boolean;
  notificationMethods: ('push' | 'email')[];
  reviewIntervals: number[];
  lastUpdated: Date;
  createdAt: Date;
}

interface UseRemindersReturn {
  reminders: Reminder[];
  settings: ReminderSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchReminders: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<ReminderSettings>) => Promise<void>;
  markReminderCompleted: (reminderId: string) => Promise<void>;
}

export const useReminders = (): UseRemindersReturn => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API ベースURL (環境変数から取得)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 認証トークンを取得する関数 (Firebase Auth を使用)
  const getAuthToken = async (): Promise<string> => {
    // ローカル開発時は認証をスキップ
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
      console.log("Skipping authentication for local development");
      return process.env.NEXT_PUBLIC_LOCAL_USER_ID || "demo-user-123";
    }

    try {
      const auth = await getAuthClient();
      const { getIdToken } = await import('firebase/auth');

      if (!auth.currentUser) {
        throw new Error('ユーザーが認証されていません');
      }

      const token = await getIdToken(auth.currentUser);
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw new Error('認証トークンの取得に失敗しました');
    }
  };

  // リマインド一覧を取得
  const fetchReminders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reminders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }

      const data = await response.json();
      if (data.success) {
        setReminders(data.data || []);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching reminders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // リマインド設定を取得
  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reminderSettings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // リマインド設定を更新
  const updateSettings = async (newSettings: Partial<ReminderSettings>) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reminderSettings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      if (data.success) {
        // 設定を再取得して最新の状態を反映
        await fetchSettings();
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // リマインドを完了済みにマーク
  const markReminderCompleted = async (reminderId: string) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reminders/${reminderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reminder status');
      }

      const data = await response.json();
      if (data.success) {
        // ローカル状態を更新
        setReminders(prev =>
          prev.map(reminder =>
            reminder.id === reminderId
              ? { ...reminder, status: 'completed' as const, updatedAt: new Date() }
              : reminder
          )
        );
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error marking reminder completed:', err);
    }
  };

  // コンポーネントマウント時に設定を取得
  useEffect(() => {
    fetchSettings();
    fetchReminders();
  }, []);

  return {
    reminders,
    settings,
    isLoading,
    error,
    fetchReminders,
    fetchSettings,
    updateSettings,
    markReminderCompleted,
  };
};
