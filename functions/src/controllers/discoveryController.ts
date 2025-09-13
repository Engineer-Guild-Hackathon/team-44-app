import { Request, Response } from "express";
import { DiscoveryService } from "../services/discoveryService";
import { DataService } from "../services/dataService";
import * as admin from "firebase-admin";

const discoveryService = new DiscoveryService();
const dataService = new DataService();

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

    // Firestoreから今日の豆知識を取得
    const knowledge = await dataService.getTodayKnowledge(userId);

    if (knowledge) {
      // データが存在する場合
      res.status(200).json({
        success: true,
        data: knowledge
      });
    } else {
      // データが存在しない場合は空のレスポンスを返す（LLM生成はバッチ処理時のみ）
      console.log(`No cached data for user ${userId}, returning empty response`);
      res.status(200).json({
        success: true,
        data: {
          knowledge: null,
          connectionToUserInterests: null
        },
        message: "今日の豆知識はまだ準備中です"
      });
    }
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

    // Firestoreから興味マップを取得
    const mapData = await dataService.getInterestMap(userId);

    if (mapData) {
      // データが存在する場合
      res.status(200).json({
        success: true,
        data: mapData
      });
    } else {
      // データが存在しない場合はデフォルトの興味マップデータを返す
      console.log(`No cached interest map for user ${userId}, returning default data`);
      res.status(200).json({
        success: true,
        data: {
          hasData: false,
          nodes: [
            { id: 'programming', category: 'プログラミング', level: 1, itemsViewed: 0 },
            { id: 'math', category: '数学', level: 1, itemsViewed: 0 },
            { id: 'science', category: '科学', level: 1, itemsViewed: 0 },
            { id: 'history', category: '歴史', level: 1, itemsViewed: 0 },
            { id: 'language', category: '言語', level: 1, itemsViewed: 0 },
            { id: 'art', category: '芸術', level: 1, itemsViewed: 0 }
          ],
          edges: [],
          placeholderMessage: "学習を始めるためのサンプルカテゴリ",
          suggestions: [
            {
              category: 'AI・機械学習',
              reason: 'プログラミングの次のステップとして、AI技術を学ぶことで将来のキャリアに役立ちます'
            },
            {
              category: 'データサイエンス',
              reason: '数学の知識を活かして、データを分析するスキルを身につけられます'
            },
            {
              category: '環境科学',
              reason: '科学の基礎知識を活かして、持続可能な未来について学ぶことができます'
            }
          ]
        },
        message: "デフォルトの興味マップを表示しています"
      });
    }
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

    // Firestoreから未開拓知識を取得
    const untappedKnowledge = await dataService.getUntappedKnowledge(userId);

    if (untappedKnowledge) {
      // データが存在する場合
      res.status(200).json({
        success: true,
        data: untappedKnowledge
      });
    } else {
      // データが存在しない場合は空のレスポンスを返す（LLM生成はバッチ処理時のみ）
      console.log(`No cached untapped knowledge for user ${userId}, returning empty response`);
      res.status(200).json({
        success: true,
        data: null,
        message: "新しい発見はまだ準備中です"
      });
    }
  } catch (error) {
    console.error("Error getting untapped knowledge:", error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
