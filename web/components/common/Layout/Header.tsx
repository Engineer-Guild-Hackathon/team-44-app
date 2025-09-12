'use client'

import Link from 'next/link'
import Navigation from './Navigation'
import ThemeToggle from '../UI/ThemeToggle'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-light)] border-b border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* tothlus Logo */}
        <Link href="/chat" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center">
            <img src="/icon-192.svg" alt="tothlus logo" className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-[var(--color-text-light)] hidden sm:block">
            tothlus
          </span>
        </Link>

        {/* Right side: Theme Toggle + Navigation */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Navigation />
        </div>
      </div>
    </header>
  )
}
