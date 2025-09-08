import * as admin from 'firebase-admin';
import { Reminder, ReminderSettings, LearningRecord } from '../models/types';

// Firebase Admin の初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export class ReminderService {
  // 忘却曲線に基づくデフォルトリマインドスケジュール（日数）
  private readonly DEFAULT_REVIEW_INTERVALS = [1, 3, 7, 14, 30];

  /**
   * ユーザーのリマインドをスケジュール
   */
  async scheduleReminders(userId: string, recordId: string): Promise<void> {
    // ユーザーのリマインド設定を取得
    const settings = await this.getUserReminderSettings(userId);

    if (!settings.enabled) {
      return; // リマインドが無効の場合は何もしない
    }

    const reviewIntervals = settings.reviewIntervals.length > 0
      ? settings.reviewIntervals
      : this.DEFAULT_REVIEW_INTERVALS;

    // 各間隔でリマインドを作成
    const now = new Date();
    for (const intervalDays of reviewIntervals) {
      const scheduledAt = new Date(now.getTime() + (intervalDays * 24 * 60 * 60 * 1000));

      const reminder: Omit<Reminder, 'id'> = {
        userId,
        recordId,
        scheduledAt,
        status: 'pending',
        type: 'review',
        createdAt: now,
        updatedAt: now
      };

      await db.collection('reminders').add(reminder);
    }
  }

  /**
   * 送信すべきリマインドを取得
   */
  async getPendingReminders(): Promise<Reminder[]> {
    const now = new Date();
    const snapshot = await db.collection('reminders')
      .where('status', '==', 'pending')
      .where('scheduledAt', '<=', now)
      .orderBy('scheduledAt', 'asc')
      .limit(100)
      .get();

    return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as Reminder));
  }

  /**
   * ユーザーの今日のリマインド取得
   */
  async getUserRemindersForToday(userId: string): Promise<Reminder[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const snapshot = await db.collection('reminders')
      .where('userId', '==', userId)
      .where('scheduledAt', '>=', startOfDay)
      .where('scheduledAt', '<=', endOfDay)
      .orderBy('scheduledAt', 'asc')
      .get();

    return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as Reminder));
  }

  /**
   * リマインドのステータスを更新
   */
  async updateReminderStatus(reminderId: string, status: 'pending' | 'sent' | 'completed'): Promise<void> {
    await db.collection('reminders').doc(reminderId).update({
      status,
      updatedAt: new Date()
    });
  }

  /**
   * ユーザーのリマインド設定を取得
   */
  async getUserReminderSettings(userId: string): Promise<ReminderSettings> {
    const doc = await db.collection('reminderSettings').doc(userId).get();

    if (!doc.exists) {
      // デフォルト設定を作成
      const defaultSettings: Omit<ReminderSettings, 'userId'> = {
        enabled: true,
        notificationMethods: ['push'],
        reviewIntervals: this.DEFAULT_REVIEW_INTERVALS,
        lastUpdated: new Date(),
        createdAt: new Date()
      };

      await db.collection('reminderSettings').doc(userId).set({
        ...defaultSettings,
        userId
      });

      return {
        userId,
        ...defaultSettings
      };
    }

    return {
      userId,
      ...doc.data()
    } as ReminderSettings;
  }

  /**
   * ユーザーのリマインド設定を更新
   */
  async updateReminderSettings(userId: string, settings: Partial<ReminderSettings>): Promise<void> {
    const updateData = {
      ...settings,
      lastUpdated: new Date()
    };

    await db.collection('reminderSettings').doc(userId).update(updateData);
  }

  /**
   * 忘却曲線に基づいて優先度の高い問題を選択
   * 簡単な実装：最近学習したものから優先的に選択
   */
  async selectHighPriorityRecords(userId: string, limit = 5): Promise<LearningRecord[]> {
    const snapshot = await db.collection('learningRecords')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as LearningRecord));
  }

  /**
   * PWAプッシュ通知の送信準備
   * 実際の通知送信はFirebase Cloud Messagingを使用
   */
  async prepareNotification(reminder: Reminder): Promise<{
    title: string;
    body: string;
    data: any;
  }> {
    // 関連する学習記録を取得
    const recordDoc = await db.collection('learningRecords').doc(reminder.recordId).get();
    const record = recordDoc.data() as LearningRecord;

    return {
      title: '学習リマインド',
      body: `${record.subject}: ${record.topic} の復習時間です`,
      data: {
        type: 'reminder',
        recordId: reminder.recordId,
        reminderId: reminder.id
      }
    };
  }
}
