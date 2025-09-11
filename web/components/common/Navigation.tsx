'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  isOpen: boolean
  onClose: () => void
}

export default function Navigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname()

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
    { href: '/', label: 'ホーム', icon: '🏠' },
    { href: '/chat', label: 'チャット', icon: '💬' },
    { href: '/calendar', label: 'カレンダー', icon: '📅' },
    { href: '/reminders', label: 'リマインダー', icon: '🔔' },
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
      } md:translate-x-0 md:static md:h-auto md:w-auto md:shadow-none md:border-r-0`}>

        {/* Header */}
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
                    <span className="text-lg">{item.icon}</span>
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

          {/* Divider */}
          <div className="my-6 border-t border-[var(--color-border)]"></div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              あなたの知識の図書館
            </p>
          </div>
        </div>
      </nav>
    </>
  )
}
