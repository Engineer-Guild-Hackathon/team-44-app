import { Request, Response } from "express";
import { LearningRecordService } from "../services/learningRecordService";
import * as admin from "firebase-admin";

const learningRecordService = new LearningRecordService();

/**
 * Firebase Auth トークンを検証してユーザー情報を取得する
 * ローカル開発時は認証をスキップ
 */
async function validateAuth(req: Request): Promise<string> {
  // ローカル開発時は認証をスキップ
  if (process.env.SKIP_AUTH === "true") {
    console.log("Skipping authentication for local development");
    return process.env.LOCAL_USER_ID || "demo-user-123";
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("認証トークンが必要です");
  }

  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid;
}

/**
 * チャットセッションから学習記録を生成
 */
export const generateLearningRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await validateAuth(req);
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: "Session ID is required" });
      return;
    }

    const learningRecord = await learningRecordService.generateRecord(sessionId, userId);

    res.status(201).json({
      success: true,
      data: learningRecord
    });
  } catch (error) {
    console.error("Error generating learning record:", error);

    if (error instanceof Error) {
      if (error.message === "Session not found") {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      if (error.message === "Unauthorized access to session") {
        res.status(403).json({ error: "Unauthorized access to session" });
        return;
      }
      if (error.message === "認証トークンが必要です") {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }

    res.status(500).json({ error: "Failed to generate learning record" });
  }
};

/**
 * ユーザーの学習記録一覧を取得
 */
export const getUserLearningRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("getUserLearningRecords called with query:", req.query);

    const userId = await validateAuth(req);
    console.log(`Authenticated user: ${userId}`);

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const subject = req.query.subject as string;

    console.log(`Fetching records with limit: ${limit}, subject: ${subject}`);

    let records;
    if (subject) {
      console.log(`Fetching records by subject: ${subject}`);
      records = await learningRecordService.getLearningRecordsBySubject(userId, subject);
    } else {
      console.log("Fetching all user records");
      records = await learningRecordService.getUserLearningRecords(userId, limit);
    }

    console.log(`Returning ${records.length} records`);

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error("Error in getUserLearningRecords controller:", error);

    if (error instanceof Error) {
      if (error.message === "認証トークンが必要です") {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Firestore 関連のエラーをより詳細に処理
      if (error.message.includes("index")) {
        console.error("Index error detected:", error.message);
        res.status(500).json({ error: "Database index error. Please check Firestore indexes." });
        return;
      }
    }

    res.status(500).json({ error: "Failed to fetch learning records" });
  }
};

/**
 * 特定の学習記録を取得
 */
export const getLearningRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await validateAuth(req);
    const { recordId } = req.params;

    if (!recordId) {
      res.status(400).json({ error: "Record ID is required" });
      return;
    }

    const learningRecord = await learningRecordService.getLearningRecord(recordId, userId);

    if (!learningRecord) {
      res.status(404).json({ error: "Learning record not found" });
      return;
    }

    res.json({
      success: true,
      data: learningRecord
    });
  } catch (error) {
    console.error("Error fetching learning record:", error);

    if (error instanceof Error) {
      if (error.message === "認証トークンが必要です") {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (error.message === "Unauthorized access to learning record") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }

    res.status(500).json({ error: "Failed to fetch learning record" });
  }
};

/**
 * 期間指定で学習記録を取得（カレンダー用）
 */
export const getLearningRecordsForPeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await validateAuth(req);
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: "startDate and endDate are required" });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

    const records = await learningRecordService.getLearningRecordsForPeriod(userId, start, end);

    res.json({
      success: true,
      records
    });
  } catch (error) {
    console.error("Error fetching learning records for period:", error);
    
    if (error instanceof Error && error.message === "認証トークンが必要です") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.status(500).json({ error: "Failed to fetch learning records for period" });
  }
};

/**
 * 手動学習記録作成（将来機能）
 */
export const createManualLearningRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, topic, summary, keyPoints } = req.body;
    const userId = await validateAuth(req);

    if (!subject || !topic) {
      res.status(400).json({ error: "subject and topic are required" });
      return;
    }

    const recordId = await learningRecordService.createManualRecord({
      userId,
      subject,
      topic,
      summary,
      keyPoints
    });

    res.json({
      success: true,
      recordId
    });
  } catch (error) {
    console.error("Error creating manual learning record:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create manual learning record"
    });
  }
};
