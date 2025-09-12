import { Request, Response } from "express";
import { DiscoveryService } from "../services/discoveryService";
import * as admin from "firebase-admin";

const discoveryService = new DiscoveryService();

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
 * ログイン時の豆知識を取得
 */
export async function getLoginKnowledge(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);

    const knowledge = await discoveryService.generateKnowledgeFromHistory(userId);

    res.status(200).json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    console.error("Error getting login knowledge:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

/**
 * 週次クイズを取得
 */
export async function getWeeklyQuiz(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);

    const quiz = await discoveryService.generateQuizFromInterests(userId);

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error("Error getting weekly quiz:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

/**
 * クイズ結果を記録
 */
export async function submitQuizResult(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);
    const { quizId, selectedOption } = req.body;

    if (!quizId || typeof selectedOption !== "number") {
      res.status(400).json({ error: "quizId and selectedOption are required" });
      return;
    }

    const result = await discoveryService.recordQuizResult(userId, quizId, selectedOption);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error submitting quiz result:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

/**
 * 興味マップデータを取得
 */
export async function getInterestMap(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);

    const mapData = await discoveryService.buildBasicInterestMap(userId);

    res.status(200).json({
      success: true,
      data: mapData
    });
  } catch (error) {
    console.error("Error getting interest map:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

/**
 * 豆知識へのインタラクションを記録
 */
export async function interactWithKnowledge(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);
    const { knowledgeId, action } = req.body;

    if (!knowledgeId || !action || !['like', 'view_detail'].includes(action)) {
      res.status(400).json({ error: "knowledgeId and valid action are required" });
      return;
    }

    const result = await discoveryService.recordKnowledgeInteraction(userId, knowledgeId, action);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error recording knowledge interaction:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

/**
 * 未開拓ジャンルの魅力を説明する豆知識を取得
 */
export async function getUntappedKnowledge(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);

    const untappedKnowledge = await discoveryService.generateUntappedKnowledge(userId);

    res.status(200).json({
      success: true,
      data: untappedKnowledge
    });
  } catch (error) {
    console.error("Error getting untapped knowledge:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
