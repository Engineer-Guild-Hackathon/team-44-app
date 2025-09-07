import * as functions from "firebase-functions";
import express, { Request, Response } from "express";
import cors from "cors";
import { createSession, postMessage, getUserSessions, getSession } from "./controllers/chatController";

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

// ヘルスチェック用エンドポイント
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 存在しないエンドポイントへの対応
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export const api = functions.https.onRequest(app);
