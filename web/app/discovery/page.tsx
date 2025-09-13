'use client'

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useDiscoveryStore } from '../../store/discoveryStore';
import Header from '../../components/common/Header';
import Navigation from '../../components/common/Navigation';
import { ErrorNavigationButtons } from '../../components/common/ErrorNavigationButtons';
import { useAuth } from '../../hooks/useAuth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HelpIcon from '@mui/icons-material/Help';
import MapIcon from '@mui/icons-material/Map';
import StarIcon from '@mui/icons-material/Star';

// ダイナミックインポートでバンドルサイズ削減
const KnowledgeDisplay = React.lazy(() => import('../../components/discovery/KnowledgeDisplay').then(mod => ({ default: mod.KnowledgeDisplay })));
const SimpleQuiz = React.lazy(() => import('../../components/discovery/SimpleQuiz').then(mod => ({ default: mod.SimpleQuiz })));
const BasicInterestMap = React.lazy(() => import('../../components/discovery/BasicInterestMap').then(mod => ({ default: mod.BasicInterestMap })));
const UntappedKnowledge = React.lazy(() => import('../../components/discovery/UntappedKnowledge').then(mod => ({ default: mod.UntappedKnowledge })));

export default function DiscoveryPage() {
  const {
    todayKnowledge,
    currentQuiz,
    interestMapData,
    untappedKnowledge,
    isLoading,
    error,
    todayKnowledgeError,
    interestMapError,
    untappedKnowledgeError,
    quizError,
    loadTodayKnowledge,
    loadInterestMap,
    loadUntappedKnowledge
  } = useDiscoveryStore();

  const { user } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();

  // 初期状態ではデータを読み込まない（高速化のため）
  // useEffect(() => {
  //   loadTodayKnowledge();
  //   loadInterestMap();
  //   loadUntappedKnowledge();
  // }, [loadTodayKnowledge, loadInterestMap, loadUntappedKnowledge]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)] flex">
        {user && (
          <>
            <Header
              user={user}
              onMenuClick={() => setIsNavOpen(true)}
              isNavOpen={isNavOpen}
              onToggleNav={() => setIsNavOpen(!isNavOpen)}
            />
            <Navigation
              isOpen={isNavOpen}
              onClose={() => setIsNavOpen(false)}
            />
          </>
        )}

        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
            <p className="text-[var(--color-text-light)]">知識を探索中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[var(--color-bg-light)]">
      {user && (
        <>
          <Header
            user={user}
            onMenuClick={() => setIsNavOpen(true)}
            isNavOpen={isNavOpen}
            onToggleNav={() => setIsNavOpen(!isNavOpen)}
          />
          <Navigation
            isOpen={isNavOpen}
            onClose={() => setIsNavOpen(false)}
          />
        </>
      )}

      {/* Header */}
      <header className="bg-[var(--color-bg-light)] border-b border-[var(--color-border)] px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl text-[var(--color-text-light)] mb-2 font-semibold">
              📚 学習発見・興味拡張
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] max-w-2xl mx-auto mb-4">
              新しい知識との出会いを通じて、学習意欲を高めましょう
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  loadTodayKnowledge();
                  loadInterestMap();
                  loadUntappedKnowledge();
                }}
                disabled={isLoading}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-dark)] font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                {isLoading ? '読み込み中...' : '全て読み込む'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 今日の豆知識 */}
          <section className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 flex items-center gap-2">
              <span className="text-2xl"><MenuBookIcon /></span>
              今日の豆知識
            </h2>
            <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
              <KnowledgeDisplay
                knowledge={todayKnowledge}
                error={todayKnowledgeError}
                onLoad={loadTodayKnowledge}
                onDetailView={() => {
                  console.log('Detail view clicked');
                }}
                onLike={() => {
                  console.log('Like clicked');
                  // interactWithKnowledge を呼び出す
                }}
              />
            </Suspense>
          </section>

          {/* クイズ */}
          <section className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 flex items-center gap-2">
              <span className="text-2xl"><PsychologyIcon /></span>
              今日のクイズ
            </h2>
            <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
              <SimpleQuiz
                quiz={currentQuiz}
                error={quizError}
                onLoad={() => {
                  // クイズ読み込み処理（未実装）
                  console.log('Load quiz clicked');
                }}
                onAnswer={(selectedOption) => {
                  console.log('Answer selected:', selectedOption);
                  // completeQuiz を呼び出す
                }}
              />
            </Suspense>
          </section>

          {/* 未開拓知識の提案 */}
          <section className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              新しい発見
            </h2>
            <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
              <UntappedKnowledge
                knowledge={untappedKnowledge}
                error={untappedKnowledgeError}
                onLoad={loadUntappedKnowledge}
                onExplore={(category) => {
                  console.log(`Exploring ${category}`);
                  // 興味マップの更新や詳細ページへの遷移など
                }}
              />
            </Suspense>
          </section>

          {/* 週次クイズ */}
          <section className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 flex items-center gap-2">
              <span className="text-2xl"><PsychologyIcon /></span>
              週次クイズ
            </h2>
            <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
              <SimpleQuiz
                quiz={currentQuiz}
                error={quizError}
                onLoad={() => {
                  // クイズ読み込み処理
                }}
                onAnswer={(result) => {
                  // クイズ完了時の処理
                  console.log('Quiz completed:', result);
                }}
              />
            </Suspense>
          </section>

          {/* 興味マップ */}
          <section className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 flex items-center gap-2">
              <span className="text-2xl"><MapIcon /></span>
              興味マップ
            </h2>
            <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
              <BasicInterestMap
                data={interestMapData}
                error={interestMapError}
                onLoad={loadInterestMap}
                onNodeClick={(category) => {
                  console.log(`Node clicked: ${category}`);
                  // モーダル表示や関連コンテンツの表示など
                }}
              />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}
