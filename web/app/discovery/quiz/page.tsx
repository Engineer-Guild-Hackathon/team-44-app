'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDiscoveryStore } from '../../../store/discoveryStore';
import { SimpleQuiz } from '../../../components/discovery/SimpleQuiz';
import { QuizItem } from '../../../types/discovery';
import Header from '../../../components/common/Header';
import Navigation from '../../../components/common/Navigation';

export default function QuizPage() {
  const { currentQuiz, isLoading, error, completeQuiz, loadInterestMap } = useDiscoveryStore();
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const router = useRouter();
  const [isNavOpen, setIsNavOpen] = useState(false);

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
      <div className="min-h-screen bg-[var(--color-bg-light)] flex">
        <Header onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
        <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <div className="text-[var(--color-error)] mb-4 text-4xl">❓</div>
              <h2 className="text-2xl font-semibold text-[var(--color-text-light)] mb-4">
                エラーが発生しました
              </h2>
              <p className="text-[var(--color-muted-foreground)] mb-6">
                {error}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  // クイズの再読み込み処理
                  loadInterestMap();
                }}
                className="w-full bg-[var(--color-primary)] text-[var(--color-text-dark)] px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
              >
                再試行
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/chat')}
                  className="flex-1 bg-[var(--color-bg-light)] border border-[var(--color-border)] text-[var(--color-text-light)] px-4 py-2 rounded hover:bg-[var(--color-accent)] hover:bg-opacity-10 transition-colors font-medium"
                >
                  ホームに戻る
                </button>

                <button
                  onClick={() => router.push('/auth')}
                  className="flex-1 bg-[var(--color-bg-light)] border border-[var(--color-border)] text-[var(--color-text-light)] px-4 py-2 rounded hover:bg-[var(--color-accent)] hover:bg-opacity-10 transition-colors font-medium"
                >
                  ログイン画面へ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] flex">
      <Header onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
      <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <div className="flex-1 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-2">
              異分野横断クイズ
            </h1>
            <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              異なる分野の意外なつながりを発見しましょう
            </p>
          </div>

          {quiz ? (
            <SimpleQuiz quiz={quiz} onAnswer={handleQuizComplete} />
          ) : (
            <div className="bg-white dark:bg-[var(--color-bg-dark)] rounded-lg shadow-[var(--shadow-md)] p-6 text-center border border-[var(--color-border)]">
              <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">クイズを準備中...</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/discovery')}
              className="bg-[var(--color-primary)] text-[var(--color-text-dark)] px-6 py-2 rounded hover:bg-opacity-90 transition-colors font-medium"
            >
              発見トップに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
