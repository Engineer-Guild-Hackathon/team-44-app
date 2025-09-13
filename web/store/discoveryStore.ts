import { create } from 'zustand';
import { DiscoveryState, KnowledgeItem, QuizItem, QuizResult, InterestMapData } from '../types/discovery';
import apiClient from '../lib/apiClient';

export const useDiscoveryStore = create<DiscoveryState & {
  // アクション
  loadTodayKnowledge: () => Promise<void>;
  completeQuiz: (result: QuizResult) => Promise<void>;
  loadInterestMap: () => Promise<void>;
  interactWithKnowledge: (knowledgeId: string, action: 'like' | 'view_detail') => Promise<void>;
  loadUntappedKnowledge: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // 個別のエラークリア
  clearTodayKnowledgeError: () => void;
  clearInterestMapError: () => void;
  clearUntappedKnowledgeError: () => void;
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
  untappedKnowledge: null,
  isLoading: false,
  error: null,
  // 個別のエラー初期化
  todayKnowledgeError: null,
  interestMapError: null,
  untappedKnowledgeError: null,
  quizError: null,

  // 今日の豆知識を読み込む
  loadTodayKnowledge: async () => {
    set({ isLoading: true, todayKnowledgeError: null });
    try {
      const response = await apiClient.getTodayKnowledge();
      set({ todayKnowledge: response.knowledge, isLoading: false });
    } catch (error) {
      console.error('Error loading today knowledge:', error);
      set({ todayKnowledgeError: '豆知識の読み込みに失敗しました', isLoading: false });
    }
  },

  // クイズを完了する
  completeQuiz: async (result: QuizResult) => {
    set({ isLoading: true, quizError: null });
    try {
      const response = await apiClient.submitQuizResult(result.quizId, result.selectedOption);
      const { quizResults } = get();
      set({
        quizResults: [...quizResults, result],
        isLoading: false
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
      set({ quizError: 'クイズ結果の送信に失敗しました', isLoading: false });
    }
  },

  // 興味マップを読み込む
  loadInterestMap: async () => {
    set({ isLoading: true, interestMapError: null });
    try {
      const response = await apiClient.getInterestMap();
      set({ interestMapData: response, isLoading: false });
    } catch (error) {
      console.error('Error loading interest map:', error);
      set({ interestMapError: '興味マップの読み込みに失敗しました', isLoading: false });
    }
  },

  // 豆知識とのインタラクションを記録
  interactWithKnowledge: async (knowledgeId: string, action: 'like' | 'view_detail') => {
    try {
      // インタラクションの記録（オプション）
      console.log(`Knowledge interaction: ${knowledgeId}, action: ${action}`);
    } catch (error) {
      console.error('Error recording knowledge interaction:', error);
    }
  },

  // 未開拓知識を読み込む
  loadUntappedKnowledge: async () => {
    set({ isLoading: true, untappedKnowledgeError: null });
    try {
      const response = await apiClient.getUntappedKnowledge();
      set({ untappedKnowledge: response, isLoading: false });
    } catch (error) {
      console.error('Error loading untapped knowledge:', error);
      set({ untappedKnowledgeError: '未開拓知識の読み込みに失敗しました', isLoading: false });
    }
  },

  // ローディング状態を設定
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // エラーを設定
  setError: (error: string | null) => set({ error }),

  // 個別のエラークリア
  clearTodayKnowledgeError: () => set({ todayKnowledgeError: null }),
  clearInterestMapError: () => set({ interestMapError: null }),
  clearUntappedKnowledgeError: () => set({ untappedKnowledgeError: null }),
  clearQuizError: () => set({ quizError: null })
}));
