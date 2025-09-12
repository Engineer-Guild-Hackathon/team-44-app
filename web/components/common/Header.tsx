'use client'

import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  onMenuClick: () => void
  isNavOpen?: boolean
  onToggleNav?: () => void
  user?: any
  onNewChat?: () => void
  showNewChatButton?: boolean
}

export default function Header({ onMenuClick, isNavOpen, onToggleNav, user, onNewChat, showNewChatButton }: HeaderProps) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-light)] border-b border-[var(--color-border)] shadow-sm ${isNavOpen ? 'md:left-80' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {user && (
              <button
                onClick={onMenuClick}
                className="p-2 hover:bg-[var(--color-accent)] hover:bg-opacity-15 rounded-lg transition-colors md:hidden"
              >
                <svg className="w-6 h-6 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Desktop Menu Toggle */}
            {onToggleNav && (
              <button
                onClick={onToggleNav}
                className="hidden md:block p-2 hover:bg-[var(--color-accent)] hover:bg-opacity-15 rounded-lg transition-colors"
                title={isNavOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
              >
                <svg className="w-6 h-6 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            )}

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/icon-192.svg" alt="tothlus logo" className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold text-[var(--color-text-light)]">
                tothlus
              </h1>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {showNewChatButton && onNewChat && (
              <button
                onClick={onNewChat}
                className="p-2 hover:bg-[var(--color-accent)] hover:bg-opacity-15 rounded-lg transition-colors"
                title="新しいチャットを開始"
              >
                <svg className="w-5 h-5 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
