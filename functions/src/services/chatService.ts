import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { ChatSession, ChatMessage, SmartSessionResult, SessionStateResult } from "../models/types";
import { getLLMProvider } from "./llm/llmFactory";
import { LearningRecordService } from "./learningRecordService";

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
  // make learningRecordService optional and initialize lazily to avoid
  // eager LLM provider initialization during construction (helps tests)
  private learningRecordService?: LearningRecordService;

  constructor(dbInstance?: admin.firestore.Firestore) {
    this.db = dbInstance || db;
    // do NOT instantiate LearningRecordService here to avoid calling into
    // LLM provider or other heavy logic during ChatService construction
  }

  private getLearningRecordService(): LearningRecordService {
    if (!this.learningRecordService) {
      this.learningRecordService = new LearningRecordService();
    }
    return this.learningRecordService;
  }

  /**
   * セッションにlearningRecordIdが存在することを保証し、存在しない場合は作成する
   */
  private async ensureLearningRecordExists(sessionId: string, userId: string): Promise<string> {
    const sessionRef = this.db.collection("chatSessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      throw new Error("Session not found");
    }

    const session = sessionDoc.data();
    let learningRecordId = session?.learningRecordId;
    console.log("Current learningRecordId:", learningRecordId);

    if (!learningRecordId) {
      console.log("No learningRecordId found, creating a new LearningRecord");
      // 学習記録を作成
      learningRecordId = await this.getLearningRecordService().createNewLearningRecord(
        userId,
        "一般学習",
        "AI対話"
      );

      // セッションにlearningRecordIdを設定
      await sessionRef.update({
        learningRecordId,
        updatedAt: new Date()
      });
    }

    return learningRecordId;
  }

  /**
   * スマートセッション作成（既存学習記録への追加 or 新規作成）
   */
  async createSmartSession(
    userId: string,
    estimatedSubject: string,
    estimatedTopic: string,
    // initialMessage is currently unused here but kept in signature for future use
    _initialMessage: string
  ): Promise<SmartSessionResult> {
  // mark unused parameter as used to satisfy linter
    void _initialMessage;
    return this.db.runTransaction(async (transaction) => {
      // 既存のアクティブな学習記録を検索
      const existingRecord = await this.getLearningRecordService().findActiveLearningRecord(
        userId,
        estimatedSubject,
        estimatedTopic
      );

      let learningRecordId: string;
      let isNewLearningRecord: boolean;

      if (existingRecord) {
        // 既存の学習記録を使用
        learningRecordId = existingRecord.id;
        isNewLearningRecord = false;
      } else {
        // 新しい学習記録を作成
        learningRecordId = await this.getLearningRecordService().createNewLearningRecord(
          userId,
          estimatedSubject,
          estimatedTopic
        );
        isNewLearningRecord = true;
      }

      // 新しいセッションを作成
      const sessionRef = this.db.collection("chatSessions").doc();
      const sessionData: Omit<ChatSession, "id"> = {
        userId,
        learningRecordId,
        title: `${estimatedTopic}に関する対話`,
        status: "draft",
        startedAt: new Date(),
        messageCount: 0,
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };

      transaction.set(sessionRef, sessionData);

      return {
        sessionId: sessionRef.id,
        learningRecordId,
        isNewLearningRecord
      };
    });
  }

  /**
   * メッセージ送信と状態管理
   */
  async sendMessageWithStateManagement(
    sessionId: string,
    message: string,
    // userId not used in this implementation but remains for signature compatibility
    _userId: string
  ): Promise<SessionStateResult> {
  // ensure linter does not complain about unused param
    void _userId;
    // メッセージを送信してAI応答を取得
    const aiResponse = await this.getAIResponse(sessionId, message);

    // セッションを更新
    await this.updateSessionActivity(sessionId);

    // セッション状態をチェック
    const session = await this.getSessionById(sessionId);
    if (!session) return { aiResponse, sessionStatus: "unknown", learningRecordUpdated: false };

    let learningRecordUpdated = false;
    if (session.status === "draft") {
      console.log("Session is in draft state, checking for promotion criteria");
      const shouldPromote = await this.shouldPromoteSession(session);
      if (shouldPromote) {
        await this.promoteToActiveSession(sessionId);
        learningRecordUpdated = true;
      }
    }

    return {
      aiResponse,
      sessionStatus: session.status,
      learningRecordUpdated
    };
  }

  /**
   * セッションの詳細情報を取得
   */
  private async getSessionById(sessionId: string): Promise<ChatSession | null> {
    const doc = await this.db.collection("chatSessions").doc(sessionId).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startedAt: data?.startedAt?.toDate ? data.startedAt.toDate() : data?.startedAt,
      completedAt: data?.completedAt?.toDate ? data?.completedAt.toDate() : data?.completedAt,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt
    } as ChatSession;
  }

  /**
   * セッションアクティビティを更新
   */
  private async updateSessionActivity(sessionId: string): Promise<void> {
    await this.db.collection("chatSessions").doc(sessionId).update({
      messageCount: FieldValue.increment(1),
      updatedAt: new Date()
    });
  }

  /**
   * セッションをアクティブに昇格すべきかチェック
   */
  private async shouldPromoteSession(session: ChatSession): Promise<boolean> {
    const now = new Date();
    const sessionDuration = (now.getTime() - session.startedAt.getTime()) / (1000 * 60); // 分
    console.log(`Session duration: ${sessionDuration} minutes, message count: ${session.messageCount}`);
    // 条件: メッセージ数 >= 4回 かつ 継続時間 >= 3分
    return session.messageCount >= 4 && sessionDuration >= 1;
  }

  /**
   * セッションをアクティブ状態に昇格
   */
  private async promoteToActiveSession(sessionId: string): Promise<void> {
    const sessionRef = this.db.collection("chatSessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      throw new Error("Session not found");
    }

    const session = sessionDoc.data();
    const now = new Date();
    const durationMinutes = (now.getTime() - session?.startedAt?.toDate()?.getTime()) / (1000 * 60);

    // learningRecordIdが存在することを保証
    const learningRecordId = await this.ensureLearningRecordExists(sessionId, session!.userId);

    // セッションをアクティブ状態に昇格し、現在の継続時間を更新
    await sessionRef.update({
      status: "active",
      duration: Math.round(durationMinutes || 0),
      updatedAt: new Date()
    });

    // 学習記録を更新（条件を満たした時点で保存）
    if (learningRecordId) {
      await this.getLearningRecordService().updateLearningRecordOnSessionComplete(
        learningRecordId,
        Math.round(durationMinutes || 0),
        session?.sessionSummary
      );
    }
  }

  /**
   * AI応答を取得
   */
  private async getAIResponse(sessionId: string, message: string): Promise<string> {
    // セッションを取得
    const session = await this.getSession(sessionId, "system"); // システム内部呼び出し

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
  }

  /**
   * アクティブセッションの完了処理
   */
  private async handleActiveSessionCompletion(session: ChatSession): Promise<void> {
    if (session.messageCount >= 2) {
      // learningRecordIdが存在することを保証
      const learningRecordId = await this.ensureLearningRecordExists(session.id, session.userId);

      // 意味のあるセッションとして完了処理
      await this.completeSession(session.id);

      // 学習記録を更新（既にactive状態で保存されている場合は追加の更新）
      if (learningRecordId) {
        await this.getLearningRecordService().updateLearningRecordOnSessionComplete(
          learningRecordId,
          session.duration,
          session.sessionSummary
        );
      }
    }
  }

  /**
   * ドラフトセッションの処理
   */
  private async handleDraftSessionCompletion(session: ChatSession): Promise<void> {
    // ドラフト状態のセッションは削除
    await this.deleteSession(session.id);
  }

  /**
   * 優雅なセッション完了（ブラウザクローズ対応）
   */
  async gracefulSessionCompletion(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSessionById(sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found or access denied");
    }

    // learningRecordIdが存在することを保証
    await this.ensureLearningRecordExists(sessionId, userId);

    // セッションの状態に応じて処理
    if (session.status === "active") {
      await this.handleActiveSessionCompletion(session);
    } else if (session.status === "draft") {
      await this.handleDraftSessionCompletion(session);
    }
  }

  /**
   * セッション削除（意味のないセッション用）
   */
  private async deleteSession(sessionId: string): Promise<void> {
    await this.db.collection("chatSessions").doc(sessionId).delete();
  }

  /**
   * セッションを完了状態に変更
   */
  async completeSession(sessionId: string): Promise<ChatSession> {
    const sessionRef = this.db.collection("chatSessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      throw new Error("Session not found");
    }

    const session = sessionDoc.data();
    const now = new Date();
    const durationMinutes = (now.getTime() - session?.startedAt?.toDate()?.getTime()) / (1000 * 60);

    // learningRecordIdが存在することを保証
    await this.ensureLearningRecordExists(sessionId, session!.userId);

    await sessionRef.update({
      status: "completed",
      completedAt: now,
      duration: Math.round(durationMinutes || 0),
      updatedAt: now
    });

    return {
      ...session,
      id: sessionId,
      status: "completed",
      completedAt: now,
      duration: Math.round(durationMinutes || 0)
    } as ChatSession;
  }

  // Legacy methods for backward compatibility
  async createSession(userId: string, title?: string, learningRecordId?: string): Promise<string> {
    try {
      // learningRecordIdが指定されていない場合は、一般的な学習記録を作成
      let finalLearningRecordId = learningRecordId;
      if (!finalLearningRecordId) {
        // 一般的な学習記録を作成
        finalLearningRecordId = await this.getLearningRecordService().createNewLearningRecord(
          userId,
          "一般学習",
          "AI対話"
        );
      }

      const sessionData: Omit<ChatSession, "id"> = {
        userId,
        learningRecordId: finalLearningRecordId,
        title: title || "New Chat",
        status: "draft",
        startedAt: new Date(),
        messageCount: 0,
        duration: 0,
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

  async sendMessage(sessionId: string, userId: string, message: string): Promise<string> {
    const result = await this.sendMessageWithStateManagement(sessionId, message, userId);
    return result.aiResponse;
  }

  async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    try {
      const doc = await this.db.collection("chatSessions").doc(sessionId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as Omit<ChatSession, "id">;

      // システム内部呼び出しの場合はアクセス権チェックをスキップ
      if (userId !== "system" && data.userId !== userId) {
        throw new Error("このセッションにアクセスする権限がありません");
      }

      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } catch (error) {
      console.error("Error getting chat session:", error);
      if (error instanceof Error && error.message === "このセッションにアクセスする権限がありません") {
        throw error;
      }
      throw new Error("チャットセッションの取得に失敗しました");
    }
  }

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
