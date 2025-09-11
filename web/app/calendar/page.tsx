'use client'

import Header from '../../components/common/Header'
import Navigation from '../../components/common/Navigation'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

export default function CalendarPage() {
  const { user } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
      <Header user={user} onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
      {user && <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />}

      <div className="flex-1">
        <main className={`pt-16 pb-20 md:pb-6 px-4 sm:px-6 lg:px-8 ${isNavOpen ? 'max-w-7xl mx-auto' : 'md:max-w-7xl md:mx-auto'}`}>
          <div className="py-6">
            <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-8">学習カレンダー</h1>
            
            {/* カレンダー機能は実装待ち */}
            <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg p-8 text-center">
              <div className="text-[var(--color-muted-foreground)]">
                学習記録カレンダー機能を実装予定
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
