import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import { createSession, postMessage, getUserSessions, getSession } from "./controllers/chatController";
import { generateLearningRecord, getUserLearningRecords, getLearningRecord } from "./controllers/learningRecordController";
import { getReminders, getReminderSettings, updateReminderSettings, updateReminderStatus } from "./controllers/reminderController";

const app = express();

// CORS設定 - 本番環境では特定のドメインのみ許可するよう変更すること
app.use(cors({ origin: true }));
app.use(express.json());

// エラーハンドリングミドルウェア
app.use((error: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// ルーティング
app.post("/chatSessions", createSession);
app.get("/chatSessions", getUserSessions);
app.get("/chatSessions/:sessionId", getSession);
app.post("/chatSessions/:sessionId/messages", postMessage);

// Learning record routes
app.post("/chatSessions/:sessionId/learningRecord", generateLearningRecord);
app.get("/learningRecords", getUserLearningRecords);
app.get("/learningRecords/:recordId", getLearningRecord);

// Reminder routes
app.get("/reminders", getReminders);
app.get("/reminderSettings", getReminderSettings);
app.put("/reminderSettings", updateReminderSettings);
app.put("/reminders/:reminderId/status", updateReminderStatus);

// ヘルスチェック用エンドポイント
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 存在しないエンドポイントへの対応
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export const api = functions.https.onRequest(app);
