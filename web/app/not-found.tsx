'use client'

import Header from '../components/common/Header'
import Navigation from '../components/common/Navigation'
import { ErrorNavigationButtons } from '../components/common/ErrorNavigationButtons'
import { useState } from 'react'

export default function NotFound() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // ルートが変わったら自動でサイドバーを閉じる
  const handleRouteChange = () => {
    setIsNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
      <Header onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
      <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <img src="/icon-192.svg" alt="tothlus logo" className="w-16 h-16" />
            </div>
            <h1 className="text-6xl font-bold text-[var(--color-text-light)] mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
              ページが見つかりません
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8">
              お探しのページは存在しないか、移動した可能性があります。
            </p>
          </div>

          <ErrorNavigationButtons
            showRetry={false}
            homeLabel="ホームに戻る"
            loginLabel="ログインする"
          />
        </div>
      </div>
    </div>
  )
}
