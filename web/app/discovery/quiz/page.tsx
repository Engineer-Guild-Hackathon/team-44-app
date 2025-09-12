'use client'

import React, { useEffect, useState } from 'react';
import { useDiscoveryStore } from '../../../store/discoveryStore';
import { SimpleQuiz } from '../../../components/discovery/SimpleQuiz';
import { QuizItem } from '../../../types/discovery';

export default function QuizPage() {
  const { currentQuiz, isLoading, error, completeQuiz, loadInterestMap } = useDiscoveryStore();
  const [quiz, setQuiz] = useState<QuizItem | null>(null);

  useEffect(() => {
    // 実際のAPI呼び出しでクイズを取得
    const fetchQuiz = async () => {
      try {
        // ここでAPIを呼び出す（storeに追加する必要がある）
        const mockQuiz: QuizItem = {
          id: 'mock-quiz-1',
          primaryCategory: '数学',
          secondaryCategory: '音楽',
          question: '数学と音楽の意外なつながりとして、正しいものはどれでしょう？',
          options: [
            'フィボナッチ数列が楽曲の構造に使われている',
            'πの値が音階の比率と同じ',
            '素数がメロディの基本となる',
            '三角関数がリズムを表す'
          ],
          correctAnswer: 0,
          explanation: 'フィボナッチ数列は自然界の多くの現象に見られ、音楽でも黄金比として楽曲の構造に活用されています。',
          googleSearchQuery: 'フィボナッチ数列 音楽 黄金比',
          createdAt: new Date()
        };
        setQuiz(mockQuiz);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      }
    };

    fetchQuiz();
  }, []);

  const handleQuizComplete = async (result: any) => {
    await completeQuiz(result);
    // 次のクイズを読み込むなどの処理
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">クイズを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            異分野横断クイズ
          </h1>
          <p className="text-gray-600">
            異なる分野の意外なつながりを発見しましょう
          </p>
        </div>

        {quiz ? (
          <SimpleQuiz quiz={quiz} onAnswer={handleQuizComplete} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">クイズを準備中...</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
