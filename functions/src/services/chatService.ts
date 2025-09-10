import * as admin from "firebase-admin";
import { ChatSession, ChatMessage } from "../models/types";
import { getLLMProvider } from "./llm/llmFactory";

// Firebase Admin の初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// LLMプロバイダーを取得する関数
const getLLMProviderInstance = () => {
  try {
    // テスト環境ではモックプロバイダーを使用
    if (process.env.USE_TEST_LLM_MOCK === "true") {
      return {
        generateResponse: async () => "Mock AI response for testing"
      };
    }
    return getLLMProvider();
  } catch (error) {
    console.error("LLM provider error:", error);
    return {
      generateResponse: async () => "Mock response due to provider error"
    };
  }
};

export class ChatService {
  private db: admin.firestore.Firestore;

  constructor(dbInstance?: admin.firestore.Firestore) {
    this.db = dbInstance || db;
  }

  /**
   * 新しいチャットセッションを作成する
   */
  async createSession(userId: string, title?: string): Promise<string> {
    try {
      const sessionData: Omit<ChatSession, "id"> = {
        userId,
        title: title || "New Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };

      const docRef = await this.db.collection("chatSessions").add(sessionData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating chat session:", error);
      throw new Error("チャットセッションの作成に失敗しました");
    }
  }

  /**
   * チャットセッションを取得する
   */
  async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    try {
      const doc = await this.db.collection("chatSessions").doc(sessionId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as Omit<ChatSession, "id">;

      // ユーザーの所有権チェック
      if (data.userId !== userId) {
        throw new Error("このセッションにアクセスする権限がありません");
      }

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } catch (error) {
      console.error("Error getting chat session:", error);
      // 権限エラーはそのまま再スロー
      if (error instanceof Error && error.message === "このセッションにアクセスする権限がありません") {
        throw error;
      }
      throw new Error("チャットセッションの取得に失敗しました");
    }
  }

  /**
   * メッセージを送信してAIからの応答を取得する
   */
  async sendMessage(sessionId: string, userId: string, message: string): Promise<string> {
    try {
      // セッションを取得
      const session = await this.getSession(sessionId, userId);
      if (!session) {
        throw new Error("チャットセッションが見つかりません");
      }

      // ユーザーメッセージを追加
      const userMessage: ChatMessage = {
        role: "user",
        parts: [{ text: message }],
        timestamp: new Date()
      };

      // LLMから応答を取得
      const provider = getLLMProviderInstance();
      const response = await provider.generateResponse(session.messages, message);

      // AIメッセージを作成
      const aiMessage: ChatMessage = {
        role: "model",
        parts: [{ text: response }],
        timestamp: new Date()
      };

      // セッションを更新
      const updatedMessages = [...session.messages, userMessage, aiMessage];
      await this.db.collection("chatSessions").doc(sessionId).update({
        messages: updatedMessages,
        updatedAt: new Date()
      });

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      // セッション関連のエラーやLLMエラーはそのまま再スロー
      if (error instanceof Error) {
        if (error.message === "チャットセッションが見つかりません" ||
            error.message === "このセッションにアクセスする権限がありません") {
          throw error;
        }
      }
      throw new Error("メッセージの送信に失敗しました");
    }
  }

  /**
   * ユーザーのチャットセッション一覧を取得する
   */
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    try {
      const snapshot = await this.db
        .collection("chatSessions")
        .where("userId", "==", userId)
        .orderBy("updatedAt", "desc")
        .get();

      return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data() as Omit<ChatSession, "id">
      }));
    } catch (error) {
      console.error("Error getting user sessions:", error);
      throw new Error("セッション一覧の取得に失敗しました");
    }
  }
}
