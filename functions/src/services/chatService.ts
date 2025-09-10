import * as admin from "firebase-admin";
import { ChatSession, ChatMessage } from "../models/types";
import { getLLMProvider } from "./llm/llmFactory";

// Firebase Admin の初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

// ローカル開発用のメモリストア（デプロイ前に簡単に取り除ける）
const useLocalMock = process.env.USE_LOCAL_FIRESTORE_MOCK === "true";
type LocalSession = Omit<import("../models/types").ChatSession, "id"> & { id: string };
const localSessions: Map<string, LocalSession> = new Map();

// LLMプロバイダーを取得する関数
const getLLMProviderInstance = () => {
  try {
    // テスト環境ではモックプロバイダーを使用
    if (process.env.USE_TEST_LLM_MOCK === 'true') {
      console.log('Using test LLM mock');
      return {
        generateResponse: async () => 'Mock AI response for testing'
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

// Firestoreインスタンスを取得する関数
const getFirestore = () => {
  try {
    return admin.firestore();
  } catch (error) {
    if (useLocalMock) {
      console.log("Firestore not available, using local mock");
      return null;
    }
    throw error;
  }
};

export class ChatService {
  /**
   * 新しいチャットセッションを作成する
   */
  async createSession(userId: string, title?: string): Promise<string> {
    // Firestoreが使えないローカル環境ではメモリに作成する
    if (useLocalMock) {
      const id = `local-${Date.now()}`;
      const session: LocalSession = {
        id,
        userId,
        title: title || "New Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };
      localSessions.set(id, session);
      console.log("Created local mock session:", id);
      return id;
    }

    try {
      const sessionData: Omit<ChatSession, "id"> = {
        userId,
        title: title || "New Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };

      const db = getFirestore();
      if (!db) {
        // ローカルモックを使用
        const id = `local-${Date.now()}`;
        const session: LocalSession = {
          id,
          userId,
          title: title || "New Chat",
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: []
        };
        localSessions.set(id, session);
        console.log("Using local mock session:", id);
        return id;
      }

      const docRef = await db.collection("chatSessions").add(sessionData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating chat session:", error);
      // Firestoreが何らかの理由で使えない場合、オプトインでローカルモックを使う
      if (useLocalMock) {
        const id = `local-${Date.now()}`;
        const session: LocalSession = {
          id,
          userId,
          title: title || "New Chat",
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: []
        };
        localSessions.set(id, session);
        console.log("Falling back to local mock session after Firestore error:", id);
        return id;
      }
      throw new Error("チャットセッションの作成に失敗しました");
    }
  }

  /**
   * チャットセッションを取得する
   */
  async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    // ローカルモックが有効で、ローカルセッションが存在すれば返す
    if (useLocalMock && sessionId.startsWith("local-")) {
      const s = localSessions.get(sessionId);
      if (!s) return null;
      if (s.userId !== userId) throw new Error("このセッションにアクセスする権限がありません");
      return s as ChatSession;
    }

    try {
      const db = getFirestore();
      if (!db) {
        // ローカルモックを使用
        const s = localSessions.get(sessionId);
        if (!s) return null;
        if (s.userId !== userId) throw new Error("このセッションにアクセスする権限がありません");
        return s as ChatSession;
      }

      const doc = await db.collection("chatSessions").doc(sessionId).get();

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
      // フォールバック：ローカルモックが有効であれば探す
      if (useLocalMock) {
        const s = localSessions.get(sessionId);
        if (!s) return null;
        if (s.userId !== userId) throw new Error("このセッションにアクセスする権限がありません");
        return s as ChatSession;
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
      if (useLocalMock && sessionId.startsWith("local-")) {
        const s = localSessions.get(sessionId);
        if (s) {
          s.messages = updatedMessages;
          s.updatedAt = new Date();
          localSessions.set(sessionId, s);
        }
      } else {
        const db = getFirestore();
        if (db) {
          await db.collection("chatSessions").doc(sessionId).update({
            messages: updatedMessages,
            updatedAt: new Date()
          });
        }
      }

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("メッセージの送信に失敗しました");
    }
  }

  /**
   * ユーザーのチャットセッション一覧を取得する
   */
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    try {
      if (useLocalMock) {
        // ローカルセッションを返す
        const sessions: ChatSession[] = [];
        localSessions.forEach((s) => {
          if (s.userId === userId) {
            sessions.push(s as ChatSession);
          }
        });
        // 更新日時でソート
        sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        return sessions;
      }

      const db = getFirestore();
      if (!db) {
        // ローカルセッションを返す
        const sessions: ChatSession[] = [];
        localSessions.forEach((s) => {
          if (s.userId === userId) {
            sessions.push(s as ChatSession);
          }
        });
        // 更新日時でソート
        sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        return sessions;
      }

      const snapshot = await db
        .collection("chatSessions")
        .where("userId", "==", userId)
        .orderBy("updatedAt", "desc")
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<ChatSession, "id">
      }));
    } catch (error) {
      console.error("Error getting user sessions:", error);
      throw new Error("セッション一覧の取得に失敗しました");
    }
  }
}
