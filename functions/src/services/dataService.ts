import * as admin from "firebase-admin";

interface DiscoveryData {
  userId: string;
  dataType: 'todayKnowledge' | 'interestMap' | 'untappedKnowledge';
  content: any;
  createdAt: Date;
  updatedAt: Date;
}

export class DataService {
  private db = admin.firestore();

  constructor() {
    // Firebase Admin SDK の初期化を確認
    if (!admin.apps.length) {
      admin.initializeApp();
    }
  }

  /**
   * Firestore に保存する前に undefined のフィールドを除去する
   */
  private sanitizeForFirestore(data: any): any {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });
    return sanitized;
  }

  /**
   * ユーザーの今日の豆知識を取得
   */
  async getTodayKnowledge(userId: string): Promise<any | null> {
    try {
      const docRef = this.db.collection("discovery_data").doc(`${userId}_todayKnowledge`);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data() as DiscoveryData;
        return data.content;
      }

      return null;
    } catch (error) {
      console.error("Error getting today knowledge:", error);
      return null;
    }
  }

  /**
   * ユーザーの興味マップを取得
   */
  async getInterestMap(userId: string): Promise<any | null> {
    try {
      const docRef = this.db.collection("discovery_data").doc(`${userId}_interestMap`);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data() as DiscoveryData;
        return data.content;
      }

      return null;
    } catch (error) {
      console.error("Error getting interest map:", error);
      return null;
    }
  }

  /**
   * ユーザーの未開拓知識を取得
   */
  async getUntappedKnowledge(userId: string): Promise<any | null> {
    try {
      const docRef = this.db.collection("discovery_data").doc(`${userId}_untappedKnowledge`);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data() as DiscoveryData;
        return data.content;
      }

      return null;
    } catch (error) {
      console.error("Error getting untapped knowledge:", error);
      return null;
    }
  }

  /**
   * ユーザーの今日の豆知識を保存
   */
  async saveTodayKnowledge(userId: string, content: any): Promise<void> {
    try {
      const docRef = this.db.collection("discovery_data").doc(`${userId}_todayKnowledge`);
      const data: DiscoveryData = {
        userId,
        dataType: 'todayKnowledge',
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await docRef.set(this.sanitizeForFirestore(data));
    } catch (error) {
      console.error("Error saving today knowledge:", error);
      throw error;
    }
  }

  /**
   * ユーザーの興味マップを保存
   */
  async saveInterestMap(userId: string, content: any): Promise<void> {
    try {
      const docRef = this.db.collection("discovery_data").doc(`${userId}_interestMap`);
      const data: DiscoveryData = {
        userId,
        dataType: 'interestMap',
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await docRef.set(this.sanitizeForFirestore(data));
    } catch (error) {
      console.error("Error saving interest map:", error);
      throw error;
    }
  }

  /**
   * ユーザーの未開拓知識を保存
   */
  async saveUntappedKnowledge(userId: string, content: any): Promise<void> {
    try {
      const docRef = this.db.collection("discovery_data").doc(`${userId}_untappedKnowledge`);
      const data: DiscoveryData = {
        userId,
        dataType: 'untappedKnowledge',
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await docRef.set(this.sanitizeForFirestore(data));
    } catch (error) {
      console.error("Error saving untapped knowledge:", error);
      throw error;
    }
  }

  /**
   * ユーザーの全ディスカバリーデータを取得
   */
  async getAllDiscoveryData(userId: string): Promise<{
    todayKnowledge: any | null;
    interestMap: any | null;
    untappedKnowledge: any | null;
  }> {
    try {
      const [todayKnowledge, interestMap, untappedKnowledge] = await Promise.all([
        this.getTodayKnowledge(userId),
        this.getInterestMap(userId),
        this.getUntappedKnowledge(userId)
      ]);

      return {
        todayKnowledge,
        interestMap,
        untappedKnowledge
      };
    } catch (error) {
      console.error("Error getting all discovery data:", error);
      return {
        todayKnowledge: null,
        interestMap: null,
        untappedKnowledge: null
      };
    }
  }

  /**
   * ユーザーの全ディスカバリーデータを保存
   */
  async saveAllDiscoveryData(userId: string, data: {
    todayKnowledge: any;
    interestMap: any;
    untappedKnowledge: any;
  }): Promise<void> {
    try {
      await Promise.all([
        this.saveTodayKnowledge(userId, data.todayKnowledge),
        this.saveInterestMap(userId, data.interestMap),
        this.saveUntappedKnowledge(userId, data.untappedKnowledge)
      ]);
    } catch (error) {
      console.error("Error saving all discovery data:", error);
      throw error;
    }
  }

  /**
   * アクティブユーザーの一覧を取得（学習記録があるユーザー）
   */
  async getActiveUsers(): Promise<string[]> {
    try {
      const snapshot = await this.db.collection("learningRecords")
        .select("userId")
        .get();

      const userIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userId) {
          userIds.add(data.userId);
        }
      });

      return Array.from(userIds);
    } catch (error) {
      console.error("Error getting active users:", error);
      return [];
    }
  }
}
