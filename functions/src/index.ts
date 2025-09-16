import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ReminderService } from "./services/reminderService";

// .envファイルを読み込む
dotenv.config();

// Firebase Admin SDK の初期化
import * as admin from "firebase-admin";
if (!admin.apps.length) {
  admin.initializeApp();
}

import { createSession, createSmartSession, postMessage, getUserSessions, getSession, completeSession } from "./controllers/chatController";
import { generateLearningRecord, getUserLearningRecords, getLearningRecord, getLearningRecordsForPeriod, createManualLearningRecord } from "./controllers/learningRecordController";
import { getReminders, getReminderSettings, updateReminderSettings, updateReminderStatus, registerFCMToken } from "./controllers/reminderController";
import { getLoginKnowledge, getWeeklyQuiz, submitQuizResult, getInterestMap, getUntappedKnowledge } from "./controllers/discoveryController";
import { getBatchStatus, getUserDataStatus, triggerDemoDataGeneration } from "./controllers/batchController";

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
app.post("/chatSessions/smart", createSmartSession);
app.get("/chatSessions", getUserSessions);
app.get("/chatSessions/:sessionId", getSession);
app.post("/chatSessions/:sessionId/messages", postMessage);
app.post("/chatSessions/:sessionId/complete", completeSession);

// Learning record routes
app.post("/chatSessions/:sessionId/learningRecord", generateLearningRecord);
app.get("/learningRecords", getUserLearningRecords);
app.get("/learningRecords/period", getLearningRecordsForPeriod);
app.get("/learningRecords/:recordId", getLearningRecord);
app.post("/learningRecords/manual", createManualLearningRecord);

// Reminder routes
app.get("/reminders", getReminders);
app.get("/reminderSettings", getReminderSettings);
app.put("/reminderSettings", updateReminderSettings);
app.put("/reminders/:reminderId/status", updateReminderStatus);
app.post("/fcm/register", registerFCMToken);

// Discovery routes
app.get("/discovery/knowledge", getLoginKnowledge);
app.get("/discovery/quiz", getWeeklyQuiz);
app.post("/discovery/quiz/result", submitQuizResult);
app.get("/discovery/map", getInterestMap);
app.get("/discovery/untapped", getUntappedKnowledge);

// Batch routes
app.get("/batch/status", getBatchStatus);
app.get("/batch/user-status", getUserDataStatus);
app.post("/batch/generate-demo", triggerDemoDataGeneration);

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

// デバッグ: 環境変数出力と Firestore 接続確認用エンドポイント
app.get("/debug/emulator-check", async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const admin = require('firebase-admin');

  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || null;

    // 現在の env を返す
    const env = {
      FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || null,
      GCLOUD_PROJECT: process.env.GCLOUD_PROJECT || null,
      NODE_ENV: process.env.NODE_ENV || null
    };

    // Firestore に簡単なクエリを投げてみる（接続確認）
    let firestoreOk = false;
    let testCount = 0;
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('debug_emulator_check').limit(1).get();
      testCount = snapshot.size;
      firestoreOk = true;
    } catch (err) {
      console.error('Firestore check failed:', err);
    }

    res.json({ env, firestoreHost, firestoreOk, testCount });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// 存在しないエンドポイントへの対応
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export const api = functions.https.onRequest(app);

// Batch functions
export { generateDiscoveryData, generateUserDiscoveryData, generateDemoData } from './batch';

// Scheduled function to process pending reminders
export const processReminders = functions.pubsub.schedule('every 10 minutes').onRun(async () => {
  const reminderService = new ReminderService();
  try {
    console.log('Processing pending reminders...');
    await reminderService.processPendingReminders();
    console.log('Reminder processing completed');
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
});
