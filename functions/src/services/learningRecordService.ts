import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { LearningRecord, ChatSession } from "../models/types";
import { getLLMProvider } from "./llm/llmFactory";

// Firebase Admin の初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export class LearningRecordService {
  private llm = getLLMProvider();

  /**
   * 初期メッセージから学習分野とトピックを推定
   */
  async estimateSubjectAndTopic(initialMessage: string): Promise<{ subject: string; topic: string; confidence: number }> {
    const prompt = `
以下のメッセージから学習分野とトピックを推定してください：

メッセージ: "${initialMessage}"

出力形式（JSON）:
{
  "subject": "学習分野（数学、英語、物理、化学、生物、国語、社会、プログラミング等）",
  "topic": "具体的なトピック（二次関数、現在完了形、力学等）",
  "confidence": 信頼度（0.0-1.0）
}
`;

    try {
      const response = await this.llm.generateResponse([], prompt);
      const cleanedResponse = response.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleanedResponse);
      return {
        subject: result.subject || "一般学習",
        topic: result.topic || "AI対話",
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error("Error estimating subject and topic:", error);
      return {
        subject: "一般学習",
        topic: "AI対話",
        confidence: 0.3
      };
    }
  }

  /**
   * セッションのメタデータからsubject/topicをLLMで推定
   */
  async estimateSubjectAndTopicFromSession(session: ChatSession): Promise<{ subject: string; topic: string; confidence: number }> {
    const messages = session.messages.map(m => m.parts.map(p => p.text).join(' ')).join(' ');
    const prompt = `
以下のチャットセッションのメタデータから、学習分野(subject)と具体的なトピック(topic)を推定してください。

タイトル: ${session.title || 'なし'}
サマリー: ${session.sessionSummary || 'なし'}
主要メッセージ: ${messages.substring(0, 500)}...

出力形式（JSON）:
{
  "subject": "学習分野（例: 数学、英語、物理）",
  "topic": "具体的なトピック（例: 二次関数、現在完了形）",
  "confidence": 0.0-1.0
}
`;

    try {
      const response = await this.llm.generateResponse([], prompt);
      const cleanedResponse = response.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleanedResponse);
      return {
        subject: result.subject || "一般学習",
        topic: result.topic || "AI対話",
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error("Error estimating from session:", error);
      return {
        subject: "一般学習",
        topic: "AI対話",
        confidence: 0.3
      };
    }
  }

  /**
   * 当日レコード一覧を取得
   */
  async getTodayLearningRecords(userId: string): Promise<LearningRecord[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const snapshot = await db
      .collection("learningRecords")
      .where("userId", "==", userId)
      .where("lastStudiedAt", ">=", startOfDay)
      .where("lastStudiedAt", "<", endOfDay)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastStudiedAt: doc.data().lastStudiedAt?.toDate ? doc.data().lastStudiedAt.toDate() : doc.data().lastStudiedAt,
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt
    } as LearningRecord));
  }

  /**
   * LLMで既存レコードとのマッチングを判断
   */
  async findMatchingLearningRecord(userId: string, subject: string, topic: string, existingRecords: LearningRecord[]): Promise<string | null> {
    if (existingRecords.length === 0) return null;

    const recordsText = existingRecords.map(r => `ID: ${r.id}, subject: ${r.subject}, topic: ${r.topic}`).join('\n');
    const prompt = `
新しいセッションのsubject: ${subject}, topic: ${topic} に対して、以下の既存レコード一覧から最も似ているものを選んでください。該当なしの場合はnullを返してください。

既存レコード:
${recordsText}

出力: {matchedId} または null
`;

    try {
      const response = await this.llm.generateResponse([], prompt);
      const matchedId = response.trim();
      return matchedId === 'null' ? null : matchedId;
    } catch (error) {
      console.error("Error finding matching record:", error);
      return null;
    }
  }

  /**
   * セッション昇格時のLearningRecord作成または紐付け
   */
  async createOrLinkLearningRecordForSession(sessionId: string, userId: string): Promise<string> {
    return db.runTransaction(async (transaction) => {
      // セッションを取得
      const sessionRef = db.collection("chatSessions").doc(sessionId);
      const sessionDoc = await transaction.get(sessionRef);
      if (!sessionDoc.exists) throw new Error("Session not found");
      const session = sessionDoc.data() as ChatSession;

      // LLM推定
      const estimation = await this.estimateSubjectAndTopicFromSession(session);

      // 当日レコード取得
      const todayRecords = await this.getTodayLearningRecords(userId);

      // マッチング
      const matchedId = await this.findMatchingLearningRecord(userId, estimation.subject, estimation.topic, todayRecords);

      let learningRecordId: string;
      if (matchedId) {
        learningRecordId = matchedId;
        // 既存レコードを更新
        const recordRef = db.collection("learningRecords").doc(matchedId);
        transaction.update(recordRef, {
          sessionCount: FieldValue.increment(1),
          lastStudiedAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // 新規作成
        const recordRef = db.collection("learningRecords").doc();
        const recordData = {
          id: recordRef.id,
          userId,
          subject: estimation.subject,
          topic: estimation.topic,
          status: "active",
          totalDuration: 0,
          sessionCount: 1,
          difficulty: 3,
          lastStudiedAt: new Date(),
          estimatedSubject: estimation.subject,
          estimatedTopic: estimation.topic,
          estimationConfidence: estimation.confidence,
          estimationMethod: "llm_session_metadata",
          createdAt: new Date(),
          updatedAt: new Date()
        };
        transaction.set(recordRef, recordData);
        learningRecordId = recordRef.id;
      }

      // セッションにlearningRecordIdを設定
      transaction.update(sessionRef, {
        learningRecordId,
        updatedAt: new Date()
      });

      // ログ
      console.log(`LearningRecord ${matchedId ? 'linked' : 'created'}: ${learningRecordId} for session ${sessionId}`);

      return learningRecordId;
    });
  }

  /**
   * アクティブな学習記録を検索（同一subject+topic）
   */
  async findActiveLearningRecord(
    userId: string,
    subject: string,
    topic: string
  ): Promise<LearningRecord | null> {
    try {
      const snapshot = await db
        .collection("learningRecords")
        .where("userId", "==", userId)
        .where("subject", "==", subject)
        .where("topic", "==", topic)
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastStudiedAt: data.lastStudiedAt?.toDate ? data.lastStudiedAt.toDate() : data.lastStudiedAt,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as LearningRecord;
    } catch (error) {
      console.error("Error finding active learning record:", error);
      return null;
    }
  }

  /**
   * 新しい学習記録を作成
   */
  async createNewLearningRecord(
    userId: string,
    subject: string,
    topic: string,
    isManuallyCreated: boolean = false
  ): Promise<string> {
    const recordRef = db.collection("learningRecords").doc();

    const recordData = {
      id: recordRef.id,
      userId,
      subject,
      topic,
      status: "active",
      totalDuration: 0,
      sessionCount: 0,
      difficulty: 3, // デフォルト
      lastStudiedAt: new Date(),
      isManuallyCreated,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await recordRef.set(recordData);
    return recordRef.id;
  }

  /**
   * 学習記録を更新（セッション追加時）
   */
  async updateLearningRecordOnSessionComplete(
    learningRecordId: string,
    sessionDuration: number,
    _sessionSummary?: string
  ): Promise<void> {
  // mark unused param for linter
    void _sessionSummary;
    const recordRef = db.collection("learningRecords").doc(learningRecordId);

    await recordRef.update({
      totalDuration: FieldValue.increment(sessionDuration),
      sessionCount: FieldValue.increment(1),
      lastStudiedAt: new Date(),
      updatedAt: new Date()
    });

    // AI分析で学習記録のサマリーを更新
    await this.updateLearningRecordSummary(learningRecordId);
  }

  /**
   * 学習記録のサマリーをAI分析で更新
   */
  private async updateLearningRecordSummary(learningRecordId: string): Promise<void> {
    try {
      // 関連する全セッションを取得
      const sessionsSnapshot = await db
        .collection("chatSessions")
        .where("learningRecordId", "==", learningRecordId)
        .where("status", "==", "completed")
        .get();

      if (sessionsSnapshot.empty) return;

      // 全セッションの内容を統合してAI分析
      const allSessionContent = sessionsSnapshot.docs.map(doc => {
        const session = doc.data();
        return `セッション: ${session.title}\n内容: ${session.sessionSummary || ""}`;
      }).join("\n\n");

      const analysisPrompt = `
以下の学習セッション群を分析して、学習記録のサマリーと重要ポイントを生成してください：

${allSessionContent}

出力形式（JSON）:
{
  "summary": "学習テーマ全体の要約（200文字程度）",
  "keyPoints": ["重要ポイント1", "重要ポイント2", "重要ポイント3"],
  "difficulty": 1から5の難易度評価
}
`;

      const analysisResponse = await this.llm.generateResponse([], analysisPrompt);
      const cleanedResponse = analysisResponse.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(cleanedResponse);

      // 学習記録を更新
      await db.collection("learningRecords").doc(learningRecordId).update({
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        difficulty: analysis.difficulty,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating learning record summary:", error);
    }
  }

  /**
   * 期間指定で学習記録一覧取得（カレンダー用）
   */
  async getLearningRecordsForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<LearningRecord[]> {
    try {
      const snapshot = await db
        .collection("learningRecords")
        .where("userId", "==", userId)
        .where("lastStudiedAt", ">=", startDate)
        .where("lastStudiedAt", "<=", endDate)
        .orderBy("lastStudiedAt", "desc")
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastStudiedAt: data.lastStudiedAt?.toDate ? data.lastStudiedAt.toDate() : data.lastStudiedAt,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as LearningRecord;
      });
    } catch (error) {
      console.error("Error getting learning records:", error);
      return [];
    }
  }

  /**
   * ユーザーの学習記録一覧を取得（従来互換性）
   */
  async getUserLearningRecords(userId: string, limit = 20): Promise<LearningRecord[]> {
    try {
      console.log(`Fetching learning records for user: ${userId}, limit: ${limit}`);

      const snapshot = await db.collection("learningRecords")
        .where("userId", "==", userId)
        .orderBy("lastStudiedAt", "desc")
        .limit(limit)
        .get();

      console.log(`Found ${snapshot.docs.length} learning records`);

      return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => {
        const data = doc.data();
        console.log(`Processing document ${doc.id}:`, data);

        return {
          id: doc.id,
          userId: data.userId,
          subject: data.subject,
          topic: data.topic,
          status: data.status || "active",
          totalDuration: data.totalDuration || 0,
          sessionCount: data.sessionCount || 0,
          difficulty: data.difficulty || 3,
          summary: data.summary,
          keyPoints: data.keyPoints,
          lastStudiedAt: data.lastStudiedAt?.toDate ? data.lastStudiedAt.toDate() : data.lastStudiedAt,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as LearningRecord;
      });
    } catch (error) {
      console.error("Error in getUserLearningRecords:", error);
      throw error;
    }
  }

  /**
   * 特定の学習記録を取得
   */
  async getLearningRecord(recordId: string, userId: string): Promise<LearningRecord | null> {
    const doc = await db.collection("learningRecords").doc(recordId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    if (!data || data.userId !== userId) {
      throw new Error("Unauthorized access to learning record");
    }

    return {
      id: doc.id,
      userId: data.userId,
      subject: data.subject,
      topic: data.topic,
      status: data.status || "active",
      totalDuration: data.totalDuration || 0,
      sessionCount: data.sessionCount || 0,
      difficulty: data.difficulty || 3,
      summary: data.summary,
      keyPoints: data.keyPoints,
      lastStudiedAt: data.lastStudiedAt?.toDate ? data.lastStudiedAt.toDate() : data.lastStudiedAt,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
    } as LearningRecord;
  }

  /**
   * 手動学習記録作成（将来機能）
   */
  async createManualRecord(data: {
    userId: string;
    subject: string;
    topic: string;
    summary?: string;
    keyPoints?: string[];
  }): Promise<string> {
    const recordId = await this.createNewLearningRecord(
      data.userId,
      data.subject,
      data.topic,
      true // isManuallyCreated = true
    );

    if (data.summary || data.keyPoints) {
      await db.collection("learningRecords").doc(recordId).update({
        summary: data.summary,
        keyPoints: data.keyPoints,
        updatedAt: new Date()
      });
    }

    return recordId;
  }

  /**
   * 教科別の学習記録を取得（従来互換性）
   */
  async getLearningRecordsBySubject(userId: string, subject: string): Promise<LearningRecord[]> {
    const snapshot = await db.collection("learningRecords")
      .where("userId", "==", userId)
      .where("subject", "==", subject)
      .orderBy("lastStudiedAt", "desc")
      .limit(10)
      .get();

    return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastStudiedAt: data.lastStudiedAt?.toDate ? data.lastStudiedAt.toDate() : data.lastStudiedAt,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as LearningRecord;
    });
  }

  // Legacy method for backward compatibility
  async generateRecord(_sessionId: string, _userId: string): Promise<LearningRecord> {
    // mark unused params for linter
    void _sessionId;
    void _userId;
    throw new Error("generateRecord is deprecated. Use the new 1:N architecture instead.");
  }
}
