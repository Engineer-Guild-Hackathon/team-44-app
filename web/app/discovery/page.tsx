'use client'

import React, { useEffect } from 'react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import { KnowledgeDisplay } from '../../components/discovery/KnowledgeDisplay';
import { SimpleQuiz } from '../../components/discovery/SimpleQuiz';
import { BasicInterestMap } from '../../components/discovery/BasicInterestMap';

export default function DiscoveryPage() {
  const {
    todayKnowledge,
    currentQuiz,
    interestMapData,
    isLoading,
    error,
    loadTodayKnowledge,
    loadInterestMap
  } = useDiscoveryStore();

  useEffect(() => {
    loadTodayKnowledge();
    loadInterestMap();
  }, [loadTodayKnowledge, loadInterestMap]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-light)]">知識を探索中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[var(--color-error)] mb-4 text-4xl">📚</div>
          <p className="text-[var(--color-text-light)] mb-4">{error}</p>
          <button
            onClick={() => {
              loadTodayKnowledge();
              loadInterestMap();
            }}
            className="bg-[var(--color-primary)] text-[var(--color-text-dark)] px-6 py-3 rounded hover:bg-opacity-90 transition-colors font-medium"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      {/* Header */}
      <header className="bg-[var(--color-bg-light)] border-b border-[var(--color-border)] px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl text-[var(--color-text-light)] mb-2 font-semibold">
              📚 学習発見・興味拡張
            </h1>
            <p className="text-[var(--color-muted-foreground)] text-lg">
              新しい知識との出会いを通じて、学習意欲を高めましょう
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 今日の豆知識 */}
          <section className="bg-white rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 flex items-center gap-2">
              <span className="text-2xl">�</span>
              今日の豆知識
            </h2>
            {todayKnowledge ? (
              <KnowledgeDisplay knowledge={todayKnowledge} />
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-[var(--color-muted-foreground)]">知識を準備中...</p>
              </div>
            )}
          </section>

          {/* 週次クイズ */}
          <section className="bg-white rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              週次クイズ
            </h2>
            {currentQuiz ? (
              <SimpleQuiz
                quiz={currentQuiz}
                onAnswer={(result) => {
                  // クイズ完了時の処理
                  console.log('Quiz completed:', result);
                }}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">❓</div>
                <p className="text-[var(--color-muted-foreground)] mb-4">クイズを準備中...</p>
                <button
                  onClick={() => {
                    // クイズ読み込み処理
                  }}
                  className="bg-[var(--color-primary)] text-[var(--color-text-dark)] px-6 py-3 rounded hover:bg-opacity-90 transition-colors font-medium"
                >
                  クイズに挑戦
                </button>
              </div>
            )}
          </section>
        </div>

        {/* 興味マップ */}
        <section className="bg-white rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            興味マップ
          </h2>
          {interestMapData ? (
            <BasicInterestMap
              mapData={interestMapData}
              hasData={interestMapData.hasData}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🌟</div>
              <p className="text-[var(--color-muted-foreground)]">興味マップを探索中...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
