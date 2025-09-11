'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'

interface NavigationProps {
  isOpen: boolean
  onClose: () => void
}

export default function Navigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const menuItems = [
    {
      href: '/chat',
      label: 'ホーム',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/calendar',
      label: 'カレンダー',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      href: '/reminders',
      label: 'リマインダー',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.445L3 21l1.868-2.317z" />
        </svg>
      )
    },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Navigation Panel */}
      <nav className={`fixed top-0 left-0 h-full w-80 bg-[var(--color-bg-light)] border-r border-[var(--color-border)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:h-screen md:w-80 md:shadow-lg`}>

        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] md:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-text-dark)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-[var(--color-text-light)]">Libraria</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-accent)] hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center space-x-3 p-6 border-b border-[var(--color-border)]">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--color-text-dark)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-[var(--color-text-light)]">Libraria</span>
        </div>

        {/* Menu Items */}
        <div className="p-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose()}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-[var(--color-text-dark)] shadow-md'
                        : 'text-[var(--color-text-light)] hover:bg-[var(--color-accent)] hover:bg-opacity-10 hover:text-[var(--color-accent)]'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg-light)] border-t border-[var(--color-border)] px-2 py-2 z-50">
            <div className="flex justify-around items-center">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose()}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-[var(--color-text-dark)]'
                        : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:bg-opacity-10 hover:text-[var(--color-accent)]'
                    }`}
                  >
                    <span className="flex-shrink-0 mb-1">{item.icon}</span>
                    <span className="text-xs font-medium truncate">{item.label}</span>
                  </Link>
                )
              })}
              {/* Logout Button for Mobile */}
              <button
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-error)] hover:bg-opacity-10 hover:text-[var(--color-error)]"
              >
                <svg className="w-5 h-5 flex-shrink-0 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-xs font-medium truncate">ログアウト</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-[var(--color-border)] md:block hidden"></div>

          {/* Logout Button */}
          <div className="md:block hidden">
            <button
              onClick={() => {
                logout()
                onClose()
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-[var(--color-text-light)] hover:bg-[var(--color-error)] hover:bg-opacity-10 hover:text-[var(--color-error)] w-full text-left"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">ログアウト</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center md:block hidden">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              あなたの知識の図書館
            </p>
          </div>
        </div>
      </nav>
    </>
  )
}
