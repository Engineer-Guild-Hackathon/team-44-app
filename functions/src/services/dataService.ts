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
      // 今日の日付を取得（YYYY-MM-DD形式）
      const today = new Date().toISOString().split('T')[0];

      // daily_knowledgeコレクションから今日のデータを取得
      const docRef = this.db.collection("daily_knowledge").doc(`${userId}_${today}`);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();
        console.log(`Found daily knowledge for user ${userId}:`, data);

        // knowledgeIdがある場合は、knowledge_itemsコレクションから詳細を取得
        if (data?.knowledgeId) {
          const knowledgeDoc = await this.db.collection("knowledge_items").doc(data.knowledgeId).get();
          if (knowledgeDoc.exists) {
            const knowledgeData = knowledgeDoc.data();
            console.log(`Found knowledge item:`, knowledgeData);
            return {
              knowledge: knowledgeData,
              connectionToUserInterests: data.connectionToUserInterests || null
            };
          }
        }

        return null;
      }

      console.log(`No daily knowledge found for user ${userId} on ${today}`);
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

      // データが存在しない場合はデフォルトの興味マップデータを返す
      console.log(`No interest map data found for user ${userId}, returning default data`);
      return {
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
      };
    } catch (error) {
      console.error("Error getting interest map:", error);
      // エラーの場合もデフォルトデータを返す
      return {
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
      };
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

      // データが存在しない場合はデフォルトの未開拓知識データを返す
      console.log(`No untapped knowledge data found for user ${userId}, returning default data`);
      return {
        category: '哲学',
        content: '「なぜ生きるのか？」という根本的な問いから始まる哲学は、日常生活のあらゆる側面に影響を与えます。',
        appeal: '論理的思考力を養い、人生の意味について深く考えるきっかけになります。',
        googleSearchQuery: '哲学 入門 なぜ生きるのか',
        nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後
      };
    } catch (error) {
      console.error("Error getting untapped knowledge:", error);
      // エラーの場合もデフォルトデータを返す
      return {
        category: '哲学',
        content: '「なぜ生きるのか？」という根本的な問いから始まる哲学は、日常生活のあらゆる側面に影響を与えます。',
        appeal: '論理的思考力を養い、人生の意味について深く考えるきっかけになります。',
        googleSearchQuery: '哲学 入門 なぜ生きるのか',
        nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後
      };
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
