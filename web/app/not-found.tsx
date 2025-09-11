'use client'

import Header from '../components/common/Header'
import Navigation from '../components/common/Navigation'
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
            <svg className="w-24 h-24 mx-auto text-[var(--color-accent)] opacity-50 mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h1 className="text-6xl font-bold text-[var(--color-text-light)] mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
              ページが見つかりません
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8">
              お探しのページは存在しないか、移動した可能性があります。
            </p>
          </div>

          <div className="space-y-4">
            <a
              href="/"
              className="block w-full bg-[var(--color-primary)] text-[var(--color-text-dark)] px-6 py-3 rounded-lg hover:bg-[var(--color-accent)] transition-colors font-medium"
            >
              ホームに戻る
            </a>
            <a
              href="/auth"
              className="block w-full bg-[var(--color-bg-light)] border border-[var(--color-border)] text-[var(--color-text-light)] px-6 py-3 rounded-lg hover:bg-[var(--color-accent)] hover:bg-opacity-10 transition-colors"
            >
              ログインする
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
