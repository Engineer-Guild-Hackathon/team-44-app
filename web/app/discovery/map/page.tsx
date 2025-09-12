'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDiscoveryStore } from '../../../store/discoveryStore';
import { BasicInterestMap } from '../../../components/discovery/BasicInterestMap';
import Header from '../../../components/common/Header';
import Navigation from '../../../components/common/Navigation';

export default function MapPage() {
  const { interestMapData, isLoading, error, loadInterestMap } = useDiscoveryStore();
  const router = useRouter();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    loadInterestMap();
  }, [loadInterestMap]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">興味マップを読み込み中...</p>
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
              <div className="text-[var(--color-error)] mb-4 text-4xl">🗺️</div>
              <h2 className="text-2xl font-semibold text-[var(--color-text-light)] mb-4">
                エラーが発生しました
              </h2>
              <p className="text-[var(--color-muted-foreground)] mb-6">
                {error}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => loadInterestMap()}
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-2">
              興味領域マップ
            </h1>
            <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              あなたの学習分野を可視化し、新しい興味の発見をサポートします
            </p>
          </div>

          {interestMapData ? (
            <BasicInterestMap
              mapData={interestMapData}
              hasData={interestMapData.hasData}
            />
          ) : (
            <div className="bg-white dark:bg-[var(--color-bg-dark)] rounded-lg shadow-[var(--shadow-md)] p-6 text-center border border-[var(--color-border)]">
              <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">興味マップを読み込み中...</p>
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
