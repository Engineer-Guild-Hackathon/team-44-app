import { Request, Response } from "express";
import { ChatService } from "../services/chatService";
import { CreateSessionRequest, PostMessageRequest } from "../models/types";
import * as admin from "firebase-admin";

const chatService = new ChatService();

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
 * 新しいチャットセッションを作成する
 */
export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);
    const { title }: CreateSessionRequest = req.body;

    const sessionId = await chatService.createSession(userId, title);

    res.status(201).json({
      sessionId,
      message: "チャットセッションが作成されました"
    });
  } catch (error) {
    console.error("Error in createSession:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "セッションの作成に失敗しました"
    });
  }
}

/**
 * チャットセッションにメッセージを送信する
 */
export async function postMessage(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);
    const { sessionId } = req.params;
    const { message }: PostMessageRequest = req.body;

    if (!message) {
      res.status(400).json({ error: "メッセージが必要です" });
      return;
    }

    const response = await chatService.sendMessage(sessionId, userId, message);

    res.status(200).json({
      response,
      sessionId,
      message: "メッセージが送信されました"
    });
  } catch (error) {
    console.error("Error in postMessage:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "メッセージの送信に失敗しました"
    });
  }
}

/**
 * ユーザーのチャットセッション一覧を取得する
 */
export async function getUserSessions(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);
    const sessions = await chatService.getUserSessions(userId);

    res.status(200).json({
      sessions,
      message: "セッション一覧を取得しました"
    });
  } catch (error) {
    console.error("Error in getUserSessions:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "セッション一覧の取得に失敗しました"
    });
  }
}

/**
 * 特定のチャットセッションを取得する
 */
export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);
    const { sessionId } = req.params;

    const session = await chatService.getSession(sessionId, userId);

    if (!session) {
      res.status(404).json({ error: "セッションが見つかりません" });
      return;
    }

    res.status(200).json({
      session,
      message: "セッションを取得しました"
    });
  } catch (error) {
    console.error("Error in getSession:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "セッションの取得に失敗しました"
    });
  }
}
