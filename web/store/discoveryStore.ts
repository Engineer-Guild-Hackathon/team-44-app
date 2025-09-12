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
  currentQuiz: null,
  quizResults: [],
  interestMapData: null,
  isLoading: false,
  error: null,

  // 今日の豆知識を読み込む
  loadTodayKnowledge: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.getTodayKnowledge();
      set({ todayKnowledge: data.knowledge, isLoading: false });
    } catch (error) {
      console.error('Error loading knowledge:', error);
      set({ error: '豆知識の読み込みに失敗しました', isLoading: false });
    }
  },

  // クイズを完了する
  completeQuiz: async (result: QuizResult) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.submitQuizResult(result.quizId, result.selectedOption);
      const { quizResults } = get();
      set({
        quizResults: [...quizResults, result],
        currentQuiz: null,
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
      const data = await apiClient.getInterestMap();
      set({ interestMapData: data, isLoading: false });
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
