import { Request, Response } from "express";
import { ChatService } from "../services/chatService";
import { LearningRecordService } from "../services/learningRecordService";
import { CreateSessionRequest, PostMessageRequest } from "../models/types";
import * as admin from "firebase-admin";

// テスト用のChatServiceインスタンス（デフォルトは通常のインスタンス）
let chatServiceInstance: ChatService = new ChatService();

// テスト用にChatServiceインスタンスを設定する関数
export function setChatServiceForTesting(service: ChatService): void {
  chatServiceInstance = service;
}

// テスト用にChatServiceインスタンスをリセットする関数
export function resetChatServiceForTesting(): void {
  chatServiceInstance = new ChatService();
}

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

    const sessionId = await chatServiceInstance.createSession(userId, title);

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
 * スマートセッション作成（AI分析による学習記録統合）
 */
export async function createSmartSession(req: Request, res: Response): Promise<void> {
  try {
    const { initialMessage } = req.body;
    const userId = await validateAuth(req);

    if (!initialMessage) {
      res.status(400).json({ error: "初期メッセージが必要です" });
      return;
    }

    // 初期メッセージからAI分析で学習分野を推定
    const learningRecordService = new LearningRecordService();
    const estimation = await learningRecordService.estimateSubjectAndTopic(initialMessage);

    // スマートセッション作成（既存記録への追加 or 新規作成）
    const result = await chatServiceInstance.createSmartSession(
      userId,
      estimation.subject,
      estimation.topic,
      initialMessage
    );

    res.json({
      success: true,
      sessionId: result.sessionId,
      learningRecordId: result.learningRecordId,
      isNewLearningRecord: result.isNewLearningRecord,
      estimation
    });
  } catch (error) {
    console.error("Error creating smart session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create smart session"
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

    // メッセージ送信: テストモックは `sendMessage` を提供するため、互換性のため
    // `sendMessageWithStateManagement` を優先し、なければ `sendMessage` を使う
    let responseResult: any;
    if (typeof (chatServiceInstance as any).sendMessageWithStateManagement === "function") {
      responseResult = await (chatServiceInstance as any).sendMessageWithStateManagement(sessionId, message, userId);
    } else if (typeof (chatServiceInstance as any).sendMessage === "function") {
      // 古いシグネチャ: sendMessage(sessionId, userId, message) -> string
      const aiResponse = await (chatServiceInstance as any).sendMessage(sessionId, userId, message);
      // For backward compatibility with tests, return a minimal shape
      responseResult = { aiResponse };
    } else {
      throw new Error("No compatible chat service method available");
    }

    res.status(200).json({
      response: responseResult.aiResponse,
      sessionId,
      sessionStatus: responseResult.sessionStatus,
      learningRecordUpdated: responseResult.learningRecordUpdated,
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
    const sessions = await chatServiceInstance.getUserSessions(userId);

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

    const session = await chatServiceInstance.getSession(sessionId, userId);

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

/**
 * セッション完了処理（ブラウザクローズ対応）
 */
export async function completeSession(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.params;
    const userId = await validateAuth(req);

    await chatServiceInstance.gracefulSessionCompletion(sessionId, userId);

    res.json({
      success: true,
      message: "Session completed successfully"
    });
  } catch (error) {
    console.error("Error completing session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete session"
    });
  }
}

/**
 * 古い仮セッション（下書きセッション）を削除
 */
export async function cleanupOldDraftSessions(req: Request, res: Response): Promise<void> {
  try {
    // 管理者権限をチェック（現在は認証されたユーザーのみ許可）
    await validateAuth(req);
    
    // クエリパラメータから時間を取得（デフォルト: 24時間）
    const hoursParam = req.query.hours as string;
    const hours = hoursParam ? parseInt(hoursParam, 10) : 24;
    
    if (isNaN(hours) || hours < 1) {
      res.status(400).json({
        error: "Invalid hours parameter. Must be a positive number."
      });
      return;
    }

    const deletedCount = await chatServiceInstance.cleanupOldDraftSessions(hours);

    res.json({
      success: true,
      deletedCount,
      message: `Successfully cleaned up ${deletedCount} old draft sessions older than ${hours} hours`
    });
  } catch (error) {
    console.error("Error cleaning up old draft sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cleanup old draft sessions"
    });
  }
}

/**
 * ユーザーの古い仮セッションを削除
 */
export async function cleanupUserOldDraftSessions(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);
    
    // クエリパラメータから時間を取得（デフォルト: 24時間）
    const hoursParam = req.query.hours as string;
    const hours = hoursParam ? parseInt(hoursParam, 10) : 24;
    
    if (isNaN(hours) || hours < 1) {
      res.status(400).json({
        error: "Invalid hours parameter. Must be a positive number."
      });
      return;
    }

    const deletedCount = await chatServiceInstance.cleanupUserOldDraftSessions(userId, hours);

    res.json({
      success: true,
      deletedCount,
      message: `Successfully cleaned up ${deletedCount} of your old draft sessions older than ${hours} hours`
    });
  } catch (error) {
    console.error("Error cleaning up user's old draft sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cleanup your old draft sessions"
    });
  }
}
