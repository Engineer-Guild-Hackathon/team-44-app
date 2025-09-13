import * as functions from "firebase-functions";
import { DiscoveryService } from "../services/discoveryService";
import { DataService } from "../services/dataService";

const discoveryService = new DiscoveryService();
const dataService = new DataService();

/**
 * ディスカバリーデータ生成バッチ処理
 * 手動実行で全アクティブユーザーのデータを生成し、Firestoreに保存
 */
export const generateDiscoveryData = functions.https.onRequest(async (req, res) => {
  try {
    console.log("Starting discovery data generation batch process...");

    // 1. アクティブユーザーの取得
    const activeUsers = await dataService.getActiveUsers();
    console.log(`Found ${activeUsers.length} active users`);

    if (activeUsers.length === 0) {
      res.json({
        success: true,
        message: "No active users found",
        processed: 0,
        successCount: 0,
        failureCount: 0
      });
      return;
    }

    // 2. 各ユーザーごとに並行処理
    const results = await Promise.allSettled(
      activeUsers.map(userId => processUserDiscoveryData(userId))
    );

    // 3. 結果の集計
    const successCount = results.filter(r => r.status === "fulfilled").length;
    const failureCount = results.filter(r => r.status === "rejected").length;

    console.log(`Batch process completed. Success: ${successCount}, Failed: ${failureCount}`);

    res.json({
      success: true,
      message: `Processed ${activeUsers.length} users. Success: ${successCount}, Failed: ${failureCount}`,
      processed: activeUsers.length,
      successCount,
      failureCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in batch process:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 個別ユーザーのディスカバリーデータを処理
 */
async function processUserDiscoveryData(userId: string): Promise<void> {
  try {
    console.log(`Processing user: ${userId}`);

    // 既存データをチェック（オプション：スキップするか上書きするか）
    const existingData = await dataService.getAllDiscoveryData(userId);
    if (existingData.todayKnowledge && existingData.interestMap && existingData.untappedKnowledge) {
      console.log(`User ${userId} already has complete data, skipping...`);
      return;
    }

    // LLMでデータを生成（並行処理）
    const [todayKnowledge, interestMap, untappedKnowledge] = await Promise.all([
      discoveryService.generateKnowledgeFromHistory(userId),
      discoveryService.buildBasicInterestMap(userId),
      discoveryService.generateUntappedKnowledge(userId)
    ]);

    // Firestoreに保存
    await dataService.saveAllDiscoveryData(userId, {
      todayKnowledge,
      interestMap,
      untappedKnowledge
    });

    console.log(`Successfully processed user: ${userId}`);

  } catch (error) {
    console.error(`Error processing user ${userId}:`, error);
    throw error;
  }
}

/**
 * 特定のユーザーのデータを生成（テスト用）
 */
export const generateUserDiscoveryData = functions.https.onRequest(async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: "userId is required"
      });
      return;
    }

    console.log(`Generating discovery data for user: ${userId}`);

    await processUserDiscoveryData(userId);

    res.json({
      success: true,
      message: `Successfully generated discovery data for user: ${userId}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error generating data for user ${req.body.userId}:`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * デモデータを生成して保存
 */
export const generateDemoData = functions.https.onRequest(async (req, res) => {
  try {
    console.log("Generating demo data...");

    // デモユーザー用のデータを生成
    const demoUsers = ["demo-user-1", "demo-user-2", "demo-user-3"];

    for (const userId of demoUsers) {
      try {
        await processUserDiscoveryData(userId);
        console.log(`Generated demo data for: ${userId}`);
      } catch (error) {
        console.error(`Failed to generate demo data for ${userId}:`, error);
        // デモデータの生成失敗は全体の失敗としない
      }
    }

    res.json({
      success: true,
      message: "Demo data generation completed",
      demoUsers,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error generating demo data:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});
