'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDiscoveryStore } from '../../../store/discoveryStore';
import { SimpleQuiz } from '../../../components/discovery/SimpleQuiz';
import { QuizItem } from '../../../types/discovery';
import Header from '../../../components/common/Header';
import Navigation from '../../../components/common/Navigation';
import { ErrorNavigationButtons } from '../../../components/common/ErrorNavigationButtons';
import { MdHelp } from 'react-icons/md';

export default function QuizPage() {
  const { currentQuiz, isLoading, error, quizError, completeQuiz, loadInterestMap } = useDiscoveryStore();
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
              <div className="text-[var(--color-error)] mb-4 text-4xl"><MdHelp /></div>
              <h2 className="text-2xl font-semibold text-[var(--color-text-light)] mb-4">
                エラーが発生しました
              </h2>
              <p className="text-[var(--color-muted-foreground)] mb-6">
                {error}
              </p>
            </div>

            <ErrorNavigationButtons
              showRetry={true}
              onRetry={() => {
                // クイズの再読み込み処理
                loadInterestMap();
              }}
              retryLabel="再試行"
              homeLabel="ホームに戻る"
              loginLabel="ログイン画面へ"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
      <Header onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
      <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <div className="flex-1 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
              異分野横断クイズ
            </h1>
            <p className="text-[var(--color-muted-foreground)]">
              異なる分野の意外なつながりを発見しましょう
            </p>
          </div>

          <SimpleQuiz
            quiz={quiz}
            error={quizError}
            onLoad={() => {
              // クイズ読み込み処理
            }}
            onAnswer={handleQuizComplete}
          />

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
