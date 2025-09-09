import axios, { AxiosInstance } from "axios";
import { getAuthClient } from "./firebase";
import { ChatSession, CreateSessionResponse, PostMessageResponse } from "../types/api";

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
   * メッセージを送信
   */
  async sendMessage(sessionId: string, message: string): Promise<PostMessageResponse> {
    const response = await this.client.post(`/chatSessions/${sessionId}/messages`, { message });
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
   * ヘルスチェック
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient();
export default apiClient;
