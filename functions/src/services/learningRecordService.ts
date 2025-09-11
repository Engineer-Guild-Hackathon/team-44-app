import * as admin from "firebase-admin";
import { LearningRecord, SubjectTopicEstimation } from "../models/types";
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
  async estimateSubjectAndTopic(initialMessage: string): Promise<SubjectTopicEstimation> {
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
    sessionSummary?: string
  ): Promise<void> {
    const recordRef = db.collection("learningRecords").doc(learningRecordId);

    await recordRef.update({
      totalDuration: admin.firestore.FieldValue.increment(sessionDuration),
      sessionCount: admin.firestore.FieldValue.increment(1),
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
        return `セッション: ${session.title}\n内容: ${session.sessionSummary || ''}`;
      }).join('\n\n');

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
  async generateRecord(sessionId: string, userId: string): Promise<LearningRecord> {
    throw new Error("generateRecord is deprecated. Use the new 1:N architecture instead.");
  }
}
