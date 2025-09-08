'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const menuItems = [
    { href: '/', label: 'ホーム', icon: '🏠', description: 'トップページに戻る' },
    { href: '/chat', label: 'AI学習', icon: '💬', description: 'AIと一緒に学習を開始' },
    { href: '/calendar', label: 'カレンダー', icon: '📅', description: '学習履歴を確認' },
    { href: '/reminders', label: 'リマインド設定', icon: '🔔', description: '復習通知を設定' },
    { href: '/auth', label: 'アカウント', icon: '👤', description: 'ログイン・設定' },
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
    
    // Reset touch state
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
        className="md:hidden flex items-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="メニューを開く"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
            }`}
          />
        </div>
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* サイドメニュー */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* メニューヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900">AI学習サポート</span>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="メニューを閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* メニューアイテム */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActiveRoute(item.href)
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:shadow-sm'
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">
                    {item.description}
                  </div>
                </div>
                {isActiveRoute(item.href) && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                )}
                <svg 
                  className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </nav>

        {/* フッター */}
        <div className="border-t p-4 space-y-4">
          {/* 学習ステータス */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">今日の学習</span>
              <span className="text-xs text-blue-600">継続中 🔥</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-blue-600">
              <span>65% 完了</span>
              <span>目標まで残り 15分</span>
            </div>
          </div>

          {/* アプリ情報 */}
          <div className="text-xs text-gray-500 text-center">
            <p>AI学習サポート v1.0</p>
            <p className="mt-1">© 2025 Learning Support</p>
            <p className="mt-1 text-blue-500">powered by AI ✨</p>
          </div>
        </div>
      </div>

      {/* デスクトップメニュー（既存のナビゲーション用） */}
      <div className="hidden md:flex items-center space-x-4">
        {menuItems.slice(0, -1).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActiveRoute(item.href)
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/auth"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ログイン
        </Link>
      </div>
    </>
  )
}
