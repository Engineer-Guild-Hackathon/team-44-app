'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../hooks/useAuth'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { user, logout, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const menuItems = [
    {
      href: '/chat',
      label: '学習',
      icon: '📚',
      description: 'AIと一緒に学習を開始',
    },
    {
      href: '/calendar',
      label: 'カレンダー',
      icon: '📅',
      description: '学習履歴を確認',
    },
    {
      href: '/reminders',
      label: 'リマインダー',
      icon: '🔔',
      description: '復習通知を設定',
    },
    {
      href: '/auth',
      label: 'アカウント',
      icon: '👤',
      description: 'ログイン・設定',
    },
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // スワイプジェスチャーの処理
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isRightSwipe = distance < -minSwipeDistance
    const isLeftSwipe = distance > minSwipeDistance

    if (isLeftSwipe && isOpen) {
      closeMenu()
    } else if (isRightSwipe && !isOpen) {
      setIsOpen(true)
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // メニューが開いているときはスクロールを無効にする
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex items-center p-2 rounded-md text-[var(--color-text-light)] hover:text-[var(--color-accent)] hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
        aria-label="メニューを開く"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
              }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'
              }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
              }`}
          />
        </div>
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden fade-in"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* サイドメニュー */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-80 bg-[var(--color-bg-light)] border-l border-[var(--color-border)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden slide-in ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* メニューヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center">
              <img src="/icon-192.svg" alt="tothlus logo" className="w-5 h-5" />
            </div>
            <span className="font-bold text-[var(--color-text-light)]">tothlus</span>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-text-light)] hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="メニューを閉じる"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* メニューアイテム（ログイン時のみ表示） */}
        {user && (
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActiveRoute(item.href)
                    ? 'bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-accent)] border-l-4 border-[var(--color-accent)] shadow-sm'
                    : 'text-[var(--color-text-light)] hover:bg-[var(--color-muted)] hover:text-[var(--color-accent)] hover:shadow-sm'
                    }`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-[var(--color-muted-foreground)] group-hover:text-[var(--color-accent)] transition-colors">
                      {item.description}
                    </div>
                  </div>
                  {isActiveRoute(item.href) && (
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" />
                  )}
                  <svg
                    className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-accent)] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* フッター */}
        <div className="border-t border-[var(--color-border)] p-4 space-y-4">
          {/* 学習ステータス */}
          <div className="bg-[var(--color-muted)] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--color-text-light)]">
                今日の学習
              </span>
              <span className="text-xs text-[var(--color-accent)]">継続中 🔥</span>
            </div>
            <div className="w-full bg-[var(--color-border)] rounded-full h-2">
              <div
                className="bg-[var(--color-accent)] h-2 rounded-full"
                style={{ width: '65%' }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-[var(--color-muted-foreground)]">
              <span>65% 完了</span>
              <span>目標まで残り 15分</span>
            </div>
          </div>

          {/* アプリ情報 */}
          <div className="text-xs text-[var(--color-muted-foreground)] text-center">
            <p>tothlus v1.0</p>
            <p className="mt-1">© 2025 tothlus</p>
            <p className="mt-1 text-[var(--color-accent)]">あなたの知識の図書館 ✨</p>
          </div>
        </div>
      </div>

      {/* デスクトップメニュー */}
      <div className="hidden md:flex items-center space-x-4">
        {user && menuItems.slice(0, -1).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveRoute(item.href)
              ? 'bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-accent)]'
              : 'text-[var(--color-text-light)] hover:text-[var(--color-accent)]'
              }`}
          >
            {item.label}
          </Link>
        ))}
        {!loading && user && (
          <button
            onClick={async () => {
              if (window.confirm('本当にログアウトしますか？')) {
                await logout()
                window.location.href = '/auth'
              }
            }}
            className="bg-[var(--color-error)] text-[var(--color-text-dark)] px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors"
          >
            ログアウト
          </button>
        )}
      </div>
    </>
  )
}
