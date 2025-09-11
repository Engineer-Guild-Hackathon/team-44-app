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
    let learningRecordUpdated = false;

    if (session && session.status === "draft") {
      const shouldPromote = await this.shouldPromoteSession(session);
      if (shouldPromote) {
        await this.promoteToActiveSession(sessionId);
        learningRecordUpdated = true;
      }
    }

    return {
      aiResponse,
      sessionStatus: session?.status || "unknown",
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

    // 条件: メッセージ数 >= 4回 かつ 継続時間 >= 3分
    return session.messageCount >= 4 && sessionDuration >= 3;
  }

  /**
   * セッションをアクティブ状態に昇格
   */
  private async promoteToActiveSession(sessionId: string): Promise<void> {
    await this.db.collection("chatSessions").doc(sessionId).update({
      status: "active",
      updatedAt: new Date()
    });
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

    // 学習コンテキストを抽出
    const learningContext = await this.extractLearningContext(session, message);

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      role: "user",
      parts: [{ text: message }],
      timestamp: new Date()
    };

    // LLMから応答を取得（学習コンテキスト付き）
    const provider = getLLMProviderInstance();
    const response = await provider.generateResponse(session.messages, message, learningContext);

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
   * セッションと学習記録から学習コンテキストを抽出
   */
  private async extractLearningContext(session: ChatSession, currentMessage: string): Promise<any> {
    try {
      // 学習記録から基本情報を取得
      if (session.learningRecordId && session.userId) {
        const learningRecord = await this.getLearningRecordService().getLearningRecord(session.learningRecordId, session.userId);
        if (learningRecord) {
          return {
            subject: learningRecord.subject,
            topic: learningRecord.topic,
            difficulty: learningRecord.difficulty || 3,
            userLevel: this.estimateUserLevel(session.messages, currentMessage)
          };
        }
      }

      // 学習記録がない場合、メッセージから推定
      const estimatedContext = await this.getLearningRecordService().estimateSubjectAndTopic(
        session.messages.map(msg => `${msg.role}: ${msg.parts[0]?.text || ""}`).join("\n") + `\nuser: ${currentMessage}`
      );

      return {
        subject: estimatedContext.subject,
        topic: estimatedContext.topic,
        difficulty: 3, // デフォルト
        userLevel: this.estimateUserLevel(session.messages, currentMessage)
      };
    } catch (error) {
      console.error("Error extracting learning context:", error);
      // エラー時はデフォルトコンテキストを返す
      return {
        subject: "一般学習",
        topic: "AI対話",
        difficulty: 3,
        userLevel: "初級"
      };
    }
  }

  /**
   * メッセージ履歴からユーザーレベルを推定
   */
  private estimateUserLevel(messages: ChatMessage[], currentMessage: string): string {
    const allMessages = [...messages, { role: "user", parts: [{ text: currentMessage }] }] as ChatMessage[];
    const userMessages = allMessages.filter(msg => msg.role === "user");
    
    if (userMessages.length <= 2) {
      return "初級";
    }

    // 高度な用語や複雑な質問パターンをチェック
    const advancedPatterns = [
      /微分|積分|関数|方程式|証明/,
      /分析|考察|評価|比較検討/,
      /応用|実装|実践|発展/,
      /なぜ.*なのか|どのような.*があるか|.*の理由/
    ];

    const recentMessages = userMessages.slice(-3).map(msg => msg.parts[0]?.text || "");
    const hasAdvancedContent = recentMessages.some(text => 
      advancedPatterns.some(pattern => pattern.test(text))
    );

    if (hasAdvancedContent) {
      return "上級";
    } else if (userMessages.length > 5) {
      return "中級";
    } else {
      return "初級";
    }
  }

  /**
   * 優雅なセッション完了（ブラウザクローズ対応）
   */
  async gracefulSessionCompletion(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSessionById(sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found or access denied");
    }

    // セッションの状態に応じて処理
    if (session.status === "active" && session.messageCount >= 2) {
      // 意味のあるセッションとして完了処理
      await this.completeSession(sessionId);

      // 学習記録を更新
      if (session.learningRecordId) {
        await this.getLearningRecordService().updateLearningRecordOnSessionComplete(
          session.learningRecordId,
          session.duration,
          session.sessionSummary
        );
      }
    } else if (session.status === "draft") {
      // ドラフト状態のセッションは削除
      await this.deleteSession(sessionId);
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
  async createSession(userId: string, title?: string): Promise<string> {
    try {
      const sessionData: Omit<ChatSession, "id"> = {
        userId,
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
