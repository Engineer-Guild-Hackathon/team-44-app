import * as admin from "firebase-admin";
import { DiscoveryLLM } from "./llm/discoveryLLM";
import { LearningRecord } from "../models/types";

interface KnowledgeItem {
  id: string;
  category: string;
  content: string;
  googleSearchQuery?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  relatedTopics: string[];
  createdAt: Date;
  views: number;
}

interface QuizItem {
  id: string;
  primaryCategory: string;
  secondaryCategory: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  googleSearchQuery?: string;
  createdAt: Date;
}

interface QuizResult {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  googleSearchQuery?: string;
}

export class DiscoveryService {
  private db = admin.firestore();
  private llm = new DiscoveryLLM();

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
   * ユーザーの学習履歴から豆知識を生成
   */
  async generateKnowledgeFromHistory(userId: string): Promise<KnowledgeItem> {
    try {
      // ユーザーの学習記録を取得
      const learningRecords = await this.getUserLearningRecords(userId);

      if (learningRecords.length === 0) {
        // データがない場合はデフォルトの豆知識を返す
        return this.getDefaultKnowledge();
      }

      // 学習分野を分析
      const subjects = [...new Set(learningRecords.map(record => record.subject))];
      const topics = [...new Set(learningRecords.map(record => record.topic))];

      // LLMで豆知識を生成
      const knowledge = await this.llm.generateKnowledge(subjects, topics);

      // Firestoreに保存
      const knowledgeRef = this.db.collection("knowledge_items").doc();
      const knowledgeData = this.sanitizeForFirestore({
        ...knowledge,
        id: knowledgeRef.id,
        createdAt: new Date(),
        views: 0
      });

      await knowledgeRef.set(knowledgeData);

      // ユーザーの今日の豆知識として記録
      await this.recordDailyKnowledge(userId, knowledgeRef.id);

      return {
        ...knowledge,
        id: knowledgeRef.id,
        createdAt: new Date(),
        views: 0
      };
    } catch (error) {
      console.error("Error generating knowledge:", error);
      return this.getDefaultKnowledge();
    }
  }

  /**
   * ユーザーの興味からクイズを生成
   */
  async generateQuizFromInterests(userId: string): Promise<QuizItem> {
    try {
      const learningRecords = await this.getUserLearningRecords(userId);
      const subjects = [...new Set(learningRecords.map(record => record.subject))];

      if (subjects.length === 0) {
        return this.getDefaultQuiz();
      }

      const quiz = await this.llm.generateQuiz(subjects);

      const quizRef = this.db.collection("quiz_items").doc();
      const quizData = this.sanitizeForFirestore({
        ...quiz,
        id: quizRef.id,
        createdAt: new Date()
      });

      await quizRef.set(quizData);

      return {
        ...quiz,
        id: quizRef.id,
        createdAt: new Date()
      };
    } catch (error) {
      console.error("Error generating quiz:", error);
      return this.getDefaultQuiz();
    }
  }

  /**
   * クイズ結果を記録
   */
  async recordQuizResult(userId: string, quizId: string, selectedOption: number): Promise<QuizResult> {
    try {
      const quizDoc = await this.db.collection("quiz_items").doc(quizId).get();
      if (!quizDoc.exists) {
        throw new Error("Quiz not found");
      }

      const quiz = quizDoc.data() as QuizItem;
      const isCorrect = selectedOption === quiz.correctAnswer;

      // 結果を記録
      await this.db.collection("quiz_results").add(this.sanitizeForFirestore({
        userId,
        quizId,
        selectedOption,
        isCorrect,
        submittedAt: new Date()
      }));

      return {
        isCorrect,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
        googleSearchQuery: quiz.googleSearchQuery
      };
    } catch (error) {
      console.error("Error recording quiz result:", error);
      throw error;
    }
  }

  /**
   * 基本的な興味マップを構築
   */
  async buildBasicInterestMap(userId: string): Promise<any> {
    try {
      const learningRecords = await this.getUserLearningRecords(userId);

      if (learningRecords.length === 0) {
        return {
          hasData: false,
          nodes: [],
          edges: [],
          placeholderMessage: "学習を始めて興味マップを作成しましょう"
        };
      }

      // シンプルなノード・エッジ構築
      const subjectCounts: { [key: string]: number } = {};
      learningRecords.forEach(record => {
        subjectCounts[record.subject] = (subjectCounts[record.subject] || 0) + 1;
      });

      const nodes = Object.keys(subjectCounts).map((subject, index) => ({
        id: `node-${index}`,
        category: subject,
        level: Math.min(subjectCounts[subject] * 20, 100),
        itemsViewed: subjectCounts[subject]
      }));

      // 簡単なエッジ（隣接ノード間）
      const edges = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
          source: nodes[i].id,
          target: nodes[i + 1].id,
          strength: 50
        });
      }

      return {
        hasData: true,
        nodes,
        edges,
        suggestions: await this.llm.generateSuggestions(Object.keys(subjectCounts))
      };
    } catch (error) {
      console.error("Error building interest map:", error);
      return {
        hasData: false,
        nodes: [],
        edges: [],
        placeholderMessage: "興味マップの読み込みに失敗しました"
      };
    }
  }

  private async getUserLearningRecords(userId: string): Promise<LearningRecord[]> {
    const snapshot = await this.db
      .collection("learningRecords")
      .where("userId", "==", userId)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LearningRecord));
  }

  private async recordDailyKnowledge(userId: string, knowledgeId: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    await this.db.collection("daily_knowledge").doc(`${userId}_${today}`).set(this.sanitizeForFirestore({
      userId,
      knowledgeId,
      date: today,
      assignedAt: new Date()
    }));
  }

  private getDefaultKnowledge(): KnowledgeItem {
    return {
      id: "default",
      category: "general",
      content: "学びは人生を豊かにします。今日も新しいことを発見しましょう！",
      difficulty: "beginner",
      tags: ["motivation"],
      relatedTopics: [],
      createdAt: new Date(),
      views: 0
    };
  }

  private getDefaultQuiz(): QuizItem {
    return {
      id: "default",
      primaryCategory: "general",
      secondaryCategory: "learning",
      question: "学習の楽しさは何でしょうか？",
      options: ["知識が増える", "新しい発見がある", "成長を感じる", "全て正解"],
      correctAnswer: 3,
      explanation: "学習には多くの喜びがあります",
      createdAt: new Date()
    };
  }

  /**
   * 豆知識へのインタラクションを記録
   */
  async recordKnowledgeInteraction(userId: string, knowledgeId: string, action: "like" | "view_detail"): Promise<{ success: boolean; message: string }> {
    try {
      const interactionRef = this.db.collection("knowledge_interactions").doc();
      await interactionRef.set(this.sanitizeForFirestore({
        userId,
        knowledgeId,
        action,
        timestamp: new Date()
      }));

      return {
        success: true,
        message: "インタラクションを記録しました"
      };
    } catch (error) {
      console.error("Error recording knowledge interaction:", error);
      throw error;
    }
  }

  /**
   * 未開拓ジャンルの魅力を説明する豆知識を生成
   */
  async generateUntappedKnowledge(userId: string): Promise<{ untappedKnowledge: any; nextAvailable: Date }> {
    try {
      const learningRecords = await this.getUserLearningRecords(userId);
      const learnedSubjects = [...new Set(learningRecords.map(record => record.subject))];

      // 未開拓ジャンルのリスト（プロトタイプ用）
      const untappedCategories = ["哲学", "歴史", "芸術", "音楽", "文学", "心理学", "経済学", "社会学"];
      const learnedCategories = learnedSubjects.filter(subject => untappedCategories.includes(subject));
      const availableCategories = untappedCategories.filter(category => !learnedCategories.includes(category));

      if (availableCategories.length === 0) {
        return {
          untappedKnowledge: null,
          nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1週間後
        };
      }

      // ランダムに未開拓ジャンルを選択
      const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

      // LLMで魅力説明を生成
      const appeal = await this.llm.generateCategoryAppeal(randomCategory, learnedSubjects);

      const untappedKnowledge = {
        category: randomCategory,
        content: appeal.content,
        appeal: appeal.appeal,
        googleSearchQuery: `${randomCategory} 学ぶ メリット`
      };

      return {
        untappedKnowledge,
        nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1週間後
      };
    } catch (error) {
      console.error("Error generating untapped knowledge:", error);
      return {
        untappedKnowledge: null,
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1日後
      };
    }
  }
}
