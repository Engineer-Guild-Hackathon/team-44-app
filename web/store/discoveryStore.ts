import { create } from 'zustand';
import { DiscoveryState, KnowledgeItem, QuizItem, QuizResult, InterestMapData } from '../types/discovery';
import apiClient from '../lib/apiClient';

export const useDiscoveryStore = create<DiscoveryState & {
  // アクション
  loadTodayKnowledge: () => Promise<void>;
  completeQuiz: (result: QuizResult) => Promise<void>;
  loadInterestMap: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}>((set, get) => ({
  // 初期状態
  todayKnowledge: null,
  currentQuiz: {
    id: 'mock-quiz-1',
    primaryCategory: 'プログラミング',
    secondaryCategory: 'TypeScript',
    question: 'TypeScriptの主な利点は何でしょうか？',
    options: [
      '実行速度が速くなる',
      '型安全性が向上する',
      'メモリ使用量が減る',
      'コードの行数が減る'
    ],
    correctAnswer: 1,
    explanation: 'TypeScriptは静的型付けにより、コンパイル時に型の不整合を検出できます。これにより実行時エラーを減らし、コードの品質を向上させます。',
    googleSearchQuery: 'TypeScript 利点',
    createdAt: new Date()
  },
  quizResults: [],
  interestMapData: null,
  isLoading: false,
  error: null,

  // 今日の豆知識を読み込む
  loadTodayKnowledge: async () => {
    set({ isLoading: true, error: null });
    try {
      // モックデータを使用
      const mockKnowledge = {
        id: 'mock-1',
        category: '数学',
        content: '微分積分は、変化率を扱う数学の分野です。日常生活でも速度や加速度などの概念に応用されています。',
        difficulty: 'intermediate' as const,
        tags: ['数学', '微分積分', '変化率'],
        relatedTopics: ['物理学', '工学'],
        createdAt: new Date(),
        views: 0,
        googleSearchQuery: '微分積分 基本'
      };
      set({ todayKnowledge: mockKnowledge, isLoading: false });
    } catch (error) {
      console.error('Error loading knowledge:', error);
      set({ error: '豆知識の読み込みに失敗しました', isLoading: false });
    }
  },

  // クイズを完了する
  completeQuiz: async (result: QuizResult) => {
    set({ isLoading: true, error: null });
    try {
      // モックデータを使用
      const mockQuiz = {
        id: 'mock-quiz-1',
        primaryCategory: 'プログラミング',
        secondaryCategory: 'TypeScript',
        question: 'TypeScriptの主な利点は何でしょうか？',
        options: [
          '実行速度が速くなる',
          '型安全性が向上する',
          'メモリ使用量が減る',
          'コードの行数が減る'
        ],
        correctAnswer: 1,
        explanation: 'TypeScriptは静的型付けにより、コンパイル時に型の不整合を検出できます。これにより実行時エラーを減らし、コードの品質を向上させます。',
        googleSearchQuery: 'TypeScript 利点',
        createdAt: new Date()
      };
      const { quizResults } = get();
      set({
        quizResults: [...quizResults, result],
        currentQuiz: mockQuiz,
        isLoading: false
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
      set({ error: 'クイズ結果の送信に失敗しました', isLoading: false });
    }
  },

  // 興味マップを読み込む
  loadInterestMap: async () => {
    set({ isLoading: true, error: null });
    try {
      // モックデータを使用
      const mockMapData = {
        hasData: true,
        nodes: [
          { id: 'node-1', category: '数学', level: 75, itemsViewed: 5 },
          { id: 'node-2', category: 'プログラミング', level: 60, itemsViewed: 4 },
          { id: 'node-3', category: '科学', level: 45, itemsViewed: 3 },
          { id: 'node-4', category: '歴史', level: 30, itemsViewed: 2 },
          { id: 'node-5', category: '英語', level: 50, itemsViewed: 3 }
        ],
        edges: [
          { source: 'node-1', target: 'node-2', strength: 60 },
          { source: 'node-2', target: 'node-3', strength: 40 },
          { source: 'node-3', target: 'node-4', strength: 30 },
          { source: 'node-4', target: 'node-5', strength: 25 }
        ],
        suggestions: [
          { category: 'プログラミング', reason: '学習記録が多い分野です' },
          { category: '数学', reason: '基礎を固めて応用に挑戦しましょう' }
        ]
      };
      set({ interestMapData: mockMapData, isLoading: false });
    } catch (error) {
      console.error('Error loading interest map:', error);
      set({ error: '興味マップの読み込みに失敗しました', isLoading: false });
    }
  },

  // ローディング状態を設定
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // エラーを設定
  setError: (error: string | null) => set({ error }),
}));
