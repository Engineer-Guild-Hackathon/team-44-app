import axios, { AxiosInstance } from "axios";
import { getAuthClient } from "./firebase";
import {
  ChatSession,
  CreateSessionResponse,
  PostMessageResponse,
  SmartSessionResponse,
  LearningRecord,
  LearningRecordsResponse
} from "../types/api";
import { UntappedKnowledgeItem } from "../types/discovery";

// Additional types for reminders
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

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 30000,
    });

    // リクエストインターセプター：認証トークンを自動で付与
    this.client.interceptors.request.use(async (config) => {
      // クライアントサイドでのみ認証トークンを付与
      if (typeof window !== 'undefined') {
        try {
          const auth = await getAuthClient();
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            const existing = (config.headers || {}) as Record<string, string>;
            config.headers = { ...existing, Authorization: `Bearer ${token}` } as any;
          }
        } catch (e) {
          // auth が利用できない場合はトークンなしでリクエストを送る
        }
      }
      return config;
    });

    // レスポンスインターセプター：エラーハンドリング
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 新しいチャットセッションを作成
   */
  async createSession(title?: string): Promise<CreateSessionResponse> {
    const response = await this.client.post('/chatSessions', { title });
    return response.data;
  }

  /**
   * スマートセッション作成（AI分析による学習記録統合）
   */
  async createSmartSession(initialMessage: string): Promise<SmartSessionResponse> {
    const response = await this.client.post('/chatSessions/smart', { initialMessage });
    return response.data;
  }

  /**
   * メッセージを送信
   */
  async sendMessage(sessionId: string, message: string): Promise<PostMessageResponse> {
    const response = await this.client.post(`/chatSessions/${sessionId}/messages`, { message });
    return response.data;
  }

  /**
   * セッション完了処理
   */
  async completeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(`/chatSessions/${sessionId}/complete`);
    return response.data;
  }

  /**
   * ユーザーのセッション一覧を取得
   */
  async getUserSessions(): Promise<ChatSession[]> {
    const response = await this.client.get('/chatSessions');
    return response.data.sessions;
  }

  /**
   * 特定のセッションを取得
   */
  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await this.client.get(`/chatSessions/${sessionId}`);
    return response.data.session;
  }

  /**
   * 学習記録を生成
   */
  async generateLearningRecord(sessionId: string): Promise<LearningRecord> {
    const response = await this.client.post(`/chatSessions/${sessionId}/learningRecord`);
    return response.data.data;
  }

  /**
   * ユーザーの学習記録一覧を取得
   */
  async getUserLearningRecords(): Promise<LearningRecord[]> {
    const response = await this.client.get('/learningRecords');
    return response.data.data;
  }

  /**
   * 期間指定で学習記録を取得（カレンダー用）
   */
  async getLearningRecordsForPeriod(startDate: Date, endDate: Date): Promise<LearningRecord[]> {
    const response = await this.client.get('/learningRecords/period', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data.records;
  }

  /**
   * 手動学習記録作成
   */
  async createManualLearningRecord(data: {
    subject: string;
    topic: string;
    summary?: string;
    keyPoints?: string[];
  }): Promise<{ success: boolean; recordId: string }> {
    const response = await this.client.post('/learningRecords/manual', data);
    return response.data;
  }

  /**
   * 特定の学習記録を取得
   */
  async getLearningRecord(recordId: string): Promise<LearningRecord> {
    const response = await this.client.get(`/learningRecords/${recordId}`);
    return response.data.data;
  }

  /**
   * ユーザーのリマインド一覧を取得
   */
  async getReminders(): Promise<Reminder[]> {
    const response = await this.client.get('/reminders');
    return response.data.data;
  }

  /**
   * リマインド設定を取得
   */
  async getReminderSettings(): Promise<ReminderSettings> {
    const response = await this.client.get('/reminderSettings');
    return response.data.data;
  }

  /**
   * リマインド設定を更新
   */
  async updateReminderSettings(settings: Partial<ReminderSettings>): Promise<void> {
    await this.client.put('/reminderSettings', settings);
  }

  /**
   * リマインドのステータスを更新
   */
  async updateReminderStatus(reminderId: string, status: 'pending' | 'sent' | 'completed'): Promise<void> {
    await this.client.put(`/reminders/${reminderId}/status`, { status });
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  /**
   * ログイン時の豆知識を取得
   */
  async getTodayKnowledge(): Promise<{ knowledge: any; connectionToUserInterests?: string }> {
    const response = await this.client.get('/discovery/knowledge');
    return response.data.data;
  }

  /**
   * 週次クイズを取得
   */
  async getWeeklyQuiz(): Promise<{ quiz: any; contextExplanation: string }> {
    const response = await this.client.get('/discovery/quiz');
    return response.data.data;
  }

  /**
   * クイズ結果を送信
   */
  async submitQuizResult(quizId: string, selectedOption: number): Promise<{ isCorrect: boolean; correctAnswer: number; explanation: string; googleSearchQuery?: string }> {
    const response = await this.client.post('/discovery/quiz/result', { quizId, selectedOption });
    return response.data.data;
  }

  /**
   * 興味マップデータを取得
   */
  async getInterestMap(): Promise<any> {
    const response = await this.client.get('/discovery/map');
    return response.data.data;
  }

  /**
   * 未開拓知識を取得
   */
  async getUntappedKnowledge(): Promise<UntappedKnowledgeItem> {
    const response = await this.client.get('/discovery/untapped');
    return response.data.data;
  }

  /**
   * バッチ処理の状態を取得
   */
  async getBatchStatus(): Promise<{
    activeUsersCount: number;
    checkedUsersCount: number;
    completeUsersCount: number;
    completionRate: number;
    userStatuses: any[];
  }> {
    const response = await this.client.get('/batch/status');
    return response.data.data;
  }

  /**
   * ユーザーのデータ状態を取得
   */
  async getUserDataStatus(): Promise<{
    userId: string;
    todayKnowledge: any;
    interestMap: any;
    untappedKnowledge: any;
    isComplete: boolean;
  }> {
    const response = await this.client.get('/batch/user-status');
    return response.data.data;
  }

  /**
   * デモデータ生成をトリガー
   */
  async triggerDemoDataGeneration(): Promise<{
    message: string;
    results: any[];
  }> {
    const response = await this.client.post('/batch/generate-demo');
    return response.data;
  }
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient();
export default apiClient;
