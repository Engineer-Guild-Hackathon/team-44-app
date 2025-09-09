import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// .envファイルを読み込む
dotenv.config();
import { createSession, postMessage, getUserSessions, getSession } from "./controllers/chatController";
import { generateLearningRecord, getUserLearningRecords, getLearningRecord } from "./controllers/learningRecordController";
import { getReminders, getReminderSettings, updateReminderSettings, updateReminderStatus } from "./controllers/reminderController";

const app = express();

// CORS設定 - 環境変数で許可ドメインを指定
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? allowedOrigins.length > 0 ? allowedOrigins : false // 本番時は指定ドメインのみ許可
    : true, // 開発時は全て許可
  credentials: true
};
app.use(cors(corsOptions));
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
app.get("/health", async (req: Request, res: Response) => {
  try {
    // LLMプロバイダーの状態を確認
    const llmStatus = process.env.LLM_PROVIDER ? 'available' : 'not_configured';
    const geminiKey = process.env.GEMINI_API_KEY ? 'configured' : 'not_configured';
    const openaiKey = process.env.OPENAI_API_KEY ? 'configured' : 'not_configured';

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      services: {
        llm: {
          provider: process.env.LLM_PROVIDER || 'none',
          status: llmStatus,
          gemini_api_key: geminiKey,
          openai_api_key: openaiKey
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 存在しないエンドポイントへの対応
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export const api = functions.https.onRequest(app);
