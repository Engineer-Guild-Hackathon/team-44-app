import * as admin from 'firebase-admin';
import { LearningRecord, ChatSession } from '../models/types';
import { getLLMProvider } from './llm/llmFactory';
import { ReminderService } from './reminderService';

// Firebase Admin の初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export class LearningRecordService {
  private llm = getLLMProvider();
  private reminderService = new ReminderService();

  /**
   * チャットセッションから学習記録を自動生成
   */
  async generateRecord(sessionId: string, userId: string): Promise<LearningRecord> {
    // セッションを取得
    const sessionDoc = await db.collection("chatSessions").doc(sessionId).get();
    if (!sessionDoc.exists) {
      throw new Error("Session not found");
    }

    const session = sessionDoc.data() as ChatSession;
    if (session.userId !== userId) {
      throw new Error("Unauthorized access to session");
    }

    // セッションからメッセージを抽出
    const messages = session.messages || [];
    if (messages.length === 0) {
      throw new Error("No messages found in session");
    }

    // 学習時間を計算（最初と最後のメッセージの時間差）
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const duration = this.calculateDuration(firstMessage.timestamp, lastMessage.timestamp);

    // AIで要約と教科・トピックを生成
    const { summary, subject, topic } = await this.generateSummaryAndCategories(messages);

    // 学習記録を作成
    const learningRecord: Omit<LearningRecord, "id"> = {
      userId,
      sessionId,
      subject,
      topic,
      summary,
      duration,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Firestoreに保存
    const docRef = await db.collection("learningRecords").add(learningRecord);

    const savedRecord = {
      id: docRef.id,
      ...learningRecord
    };

    // 学習記録が作成されたら、自動的にリマインドもスケジュール
    try {
      await this.reminderService.scheduleReminders(userId, docRef.id);
      console.log(`Reminders scheduled for learning record: ${docRef.id}`);
    } catch (error) {
      console.error('Failed to schedule reminders:', error);
      // リマインドのスケジューリングが失敗しても学習記録の作成は成功とする
    }

    return savedRecord;
  }

  /**
   * ユーザーの学習記録一覧を取得
   */
  async getUserLearningRecords(userId: string, limit = 20): Promise<LearningRecord[]> {
    try {
      console.log(`Fetching learning records for user: ${userId}, limit: ${limit}`);

      const snapshot = await db.collection("learningRecords")
        .where("userId", "==", userId)
        .orderBy("completedAt", "desc")
        .limit(limit)
        .get();

      console.log(`Found ${snapshot.docs.length} learning records`);

      return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => {
        const data = doc.data();
        console.log(`Processing document ${doc.id}:`, data);

        return {
          id: doc.id,
          userId: data.userId,
          sessionId: data.sessionId,
          subject: data.subject,
          topic: data.topic,
          summary: data.summary,
          duration: data.duration,
          completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        } as LearningRecord;
      });
    } catch (error) {
      console.error("Error in getUserLearningRecords:", error);
      throw error;
    }
  }

  /**
   * 教科別の学習記録を取得
   */
  async getLearningRecordsBySubject(userId: string, subject: string): Promise<LearningRecord[]> {
    const snapshot = await db.collection("learningRecords")
      .where("userId", "==", userId)
      .where("subject", "==", subject)
      .orderBy("completedAt", "desc")
      .limit(10)
      .get();

    return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as LearningRecord));
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
      sessionId: data.sessionId,
      subject: data.subject,
      topic: data.topic,
      summary: data.summary,
      duration: data.duration,
      completedAt: data.completedAt,
      createdAt: data.createdAt
    } as LearningRecord;
  }

  /**
   * 学習時間を計算（分単位）
   */
  private calculateDuration(startTime?: Date, endTime?: Date): number {
    if (!startTime || !endTime) {
      return 30; // デフォルト30分
    }

    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    // 最小5分、最大180分（3時間）
    return Math.max(5, Math.min(180, diffMinutes));
  }

  /**
   * AIを使って要約と教科・トピックを生成
   */
  private async generateSummaryAndCategories(messages: any[]): Promise<{
    summary: string;
    subject: string;
    topic: string;
  }> {
    // メッセージをテキストに変換
    const conversationText = messages
      .map(msg => `${msg.role}: ${msg.parts[0]?.text || ""}`)
      .join("\n");

    const prompt = `
以下の学習対話から、学習記録を生成してください。

対話内容:
${conversationText}

以下のJSON形式で回答してください：
{
  "summary": "学習内容の要約（100-200文字）",
  "subject": "教科名（例：math, science, english, history, programming）",
  "topic": "具体的なトピック（例：二次方程式、化学反応、過去形）"
}

注意：
- 学習に関係ない対話の場合は、subject を "general" にしてください
- 要約は学習者が後で振り返りやすいように具体的に書いてください
`;

    try {
      const response = await this.llm.generateResponse([], prompt);
      const cleanedResponse = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedResponse);

      return {
        summary: parsed.summary || "学習対話を行いました",
        subject: parsed.subject || "general",
        topic: parsed.topic || "一般的な質問・回答"
      };
    } catch (error) {
      console.error("Failed to generate summary:", error);

      // フォールバック
      return {
        summary: "学習対話を行いました",
        subject: "general",
        topic: "一般的な質問・回答"
      };
    }
  }
}
