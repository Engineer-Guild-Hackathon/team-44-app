import { Request, Response } from "express";
import { ReminderService } from "../services/reminderService";
import * as admin from "firebase-admin";

const reminderService = new ReminderService();

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
 * ユーザーのリマインド一覧を取得
 */
export const getReminders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await validateAuth(req);
    const reminders = await reminderService.getUserRemindersForToday(userId);

    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);

    if (error instanceof Error && error.message === "認証トークンが必要です") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.status(500).json({ error: "Failed to fetch reminders" });
  }
};

/**
 * ユーザーのリマインド設定を取得
 */
export const getReminderSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await validateAuth(req);
    const settings = await reminderService.getUserReminderSettings(userId);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("Error fetching reminder settings:", error);

    if (error instanceof Error && error.message === "認証トークンが必要です") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.status(500).json({ error: "Failed to fetch reminder settings" });
  }
};

/**
 * ユーザーのリマインド設定を更新
 */
export const updateReminderSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await validateAuth(req);
    const { enabled, notificationMethods, reviewIntervals } = req.body;

    // バリデーション
    if (typeof enabled !== "undefined" && typeof enabled !== "boolean") {
      res.status(400).json({ error: "enabled must be a boolean" });
      return;
    }

    if (notificationMethods && !Array.isArray(notificationMethods)) {
      res.status(400).json({ error: "notificationMethods must be an array" });
      return;
    }

    if (reviewIntervals && !Array.isArray(reviewIntervals)) {
      res.status(400).json({ error: "reviewIntervals must be an array" });
      return;
    }

    const updateData: any = {};
    if (typeof enabled !== "undefined") updateData.enabled = enabled;
    if (notificationMethods) updateData.notificationMethods = notificationMethods;
    if (reviewIntervals) updateData.reviewIntervals = reviewIntervals;

    await reminderService.updateReminderSettings(userId, updateData);

    res.json({
      success: true,
      message: "Reminder settings updated successfully"
    });
  } catch (error) {
    console.error("Error updating reminder settings:", error);

    if (error instanceof Error && error.message === "認証トークンが必要です") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.status(500).json({ error: "Failed to update reminder settings" });
  }
};

/**
 * リマインドのステータスを更新
 */
export const updateReminderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    await validateAuth(req);
    const { reminderId } = req.params;
    const { status } = req.body;

    if (!reminderId) {
      res.status(400).json({ error: "Reminder ID is required" });
      return;
    }

    if (!status || !["pending", "sent", "completed"].includes(status)) {
      res.status(400).json({ error: "Valid status is required (pending, sent, completed)" });
      return;
    }

    await reminderService.updateReminderStatus(reminderId, status);

    res.json({
      success: true,
      message: "Reminder status updated successfully"
    });
  } catch (error) {
    console.error("Error updating reminder status:", error);

    if (error instanceof Error && error.message === "認証トークンが必要です") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.status(500).json({ error: "Failed to update reminder status" });
  }
};
