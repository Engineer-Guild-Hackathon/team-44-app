import { Request, Response } from "express";
import { DataService } from "../services/dataService";
import * as admin from "firebase-admin";

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
 * バッチ処理の状態を取得
 */
export async function getBatchStatus(req: Request, res: Response): Promise<void> {
  try {
    // アクティブユーザーの数を取得
    const activeUsers = await dataService.getActiveUsers();

    // 各ユーザーのデータ存在状況をチェック
    const userStatuses = await Promise.all(
      activeUsers.slice(0, 10).map(async (userId) => { // 最初の10ユーザーのみチェック
        const data = await dataService.getAllDiscoveryData(userId);
        return {
          userId,
          hasTodayKnowledge: !!data.todayKnowledge,
          hasInterestMap: !!data.interestMap,
          hasUntappedKnowledge: !!data.untappedKnowledge,
          isComplete: !!(data.todayKnowledge && data.interestMap && data.untappedKnowledge)
        };
      })
    );

    const completeCount = userStatuses.filter(status => status.isComplete).length;
    const totalChecked = userStatuses.length;

    res.json({
      success: true,
      data: {
        activeUsersCount: activeUsers.length,
        checkedUsersCount: totalChecked,
        completeUsersCount: completeCount,
        completionRate: totalChecked > 0 ? (completeCount / totalChecked) * 100 : 0,
        userStatuses: userStatuses.slice(0, 5) // 最初の5ユーザーのみ詳細表示
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error getting batch status:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 特定のユーザーのデータを確認
 */
export async function getUserDataStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = await validateAuth(req);

    const data = await dataService.getAllDiscoveryData(userId);

    res.json({
      success: true,
      data: {
        userId,
        todayKnowledge: data.todayKnowledge ? {
          exists: true,
          category: data.todayKnowledge.category,
          createdAt: data.todayKnowledge.createdAt
        } : null,
        interestMap: data.interestMap ? {
          exists: true,
          hasData: data.interestMap.hasData,
          nodeCount: data.interestMap.nodes?.length || 0
        } : null,
        untappedKnowledge: data.untappedKnowledge ? {
          exists: true,
          category: data.untappedKnowledge.category
        } : null,
        isComplete: !!(data.todayKnowledge && data.interestMap && data.untappedKnowledge)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error getting user data status:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * デモデータを手動で生成
 */
export async function triggerDemoDataGeneration(req: Request, res: Response): Promise<void> {
  try {
    console.log("Triggering demo data generation...");

    // デモユーザー用のデータを生成
    const demoUsers = ['demo-user-1', 'demo-user-2', 'demo-user-3'];
    const results = [];

    for (const userId of demoUsers) {
      try {
        // 既存データをチェック
        const existingData = await dataService.getAllDiscoveryData(userId);
        if (existingData.todayKnowledge && existingData.interestMap && existingData.untappedKnowledge) {
          results.push({
            userId,
            status: 'skipped',
            reason: 'Data already exists'
          });
          continue;
        }

        // デモデータを生成して保存
        const demoData = generateDemoDataForUser(userId);
        await dataService.saveAllDiscoveryData(userId, demoData);

        results.push({
          userId,
          status: 'success'
        });

      } catch (error) {
        console.error(`Failed to generate demo data for ${userId}:`, error);
        results.push({
          userId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      message: "Demo data generation completed",
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error triggering demo data generation:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * デモユーザー用のデータを生成
 */
function generateDemoDataForUser(userId: string) {
  const userIndex = parseInt(userId.split('-').pop() || '1');

  // ユーザーごとに異なるデモデータを生成
  const categories = ['数学', 'プログラミング', '科学', '歴史', '芸術'];
  const category = categories[(userIndex - 1) % categories.length];

  return {
    todayKnowledge: {
      id: `demo-knowledge-${userId}`,
      category,
      content: `${category}は非常に興味深い分野です。日常生活でも多くの応用が見られます。`,
      difficulty: 'intermediate' as const,
      tags: [category, '学習', '発見'],
      relatedTopics: ['思考力', '問題解決'],
      createdAt: new Date(),
      views: Math.floor(Math.random() * 100)
    },
    interestMap: {
      hasData: true,
      nodes: [
        { id: 'node-1', category, level: 70 + Math.floor(Math.random() * 30), itemsViewed: 5 + Math.floor(Math.random() * 10) },
        { id: 'node-2', category: '基礎', level: 80 + Math.floor(Math.random() * 20), itemsViewed: 8 + Math.floor(Math.random() * 12) }
      ],
      edges: [{ source: 'node-1', target: 'node-2', strength: 60 }],
      suggestions: [
        { category: '応用', reason: `${category}の応用分野として関連が深い` }
      ]
    },
    untappedKnowledge: {
      category: '哲学',
      content: '哲学は根本的な思考力を養う分野です。',
      appeal: `${category}の理解を深める上で重要な視点を提供します。`,
      googleSearchQuery: '哲学 学び方'
    }
  };
}
