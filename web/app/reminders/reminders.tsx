'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Header from '../../components/common/Header'
import Navigation from '../../components/common/Navigation'
import { ReminderSettings } from './components/ReminderSettings'
import { NotificationPrompt } from './components/NotificationPrompt'

interface ReminderPageProps {
  // 必要に応じてpropsを追加
}

export default function RemindersComponent() {
  const { user } = useAuth();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isNavOpen, setIsNavOpen] = useState(false)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // ルートが変わったら自動でサイドバーを閉じる
  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    // 通知権限の状態を確認
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)

      // 権限が未設定の場合、プロンプトを表示
      if (Notification.permission === 'default') {
        setShowNotificationPrompt(true)
      }
    }
  }, [])

  const handleNotificationPermissionGranted = () => {
    setNotificationPermission('granted')
    setShowNotificationPrompt(false)
  }

  const handleNotificationPermissionDenied = () => {
    setNotificationPermission('denied')
    setShowNotificationPrompt(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
      <Header user={user} onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
      {user && <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1">
        {!user ? (
          <div className="flex items-center justify-center h-full pt-16">
            <div className="text-center max-w-md mx-auto px-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                ログインが必要です
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                リマインド機能を利用するには、ログインしてください。
              </p>
              <a
                href="/auth"
                className="inline-block bg-[var(--color-primary)] text-[var(--color-text-dark)] px-6 py-2 rounded-lg hover:bg-[var(--color-accent)] transition-colors"
              >
                ログインする
              </a>
            </div>
          </div>
        ) : (
          <main className={`pt-16 pb-20 md:pb-6 px-4 sm:px-6 lg:px-8 ${isNavOpen ? 'max-w-7xl mx-auto' : 'md:max-w-7xl md:mx-auto'}`}>
            <div className="py-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
                    リマインド設定
                  </h1>
                  <p className="text-[var(--color-muted-foreground)]">
                    学習継続をサポートするリマインド通知の設定を管理できます
                  </p>
                </div>

                {/* 通知権限のステータス表示 */}
                <div className="mb-6 p-6 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg">
                  <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">通知の状態</h2>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${notificationPermission === 'granted' ? 'bg-[var(--color-success)]' :
                      notificationPermission === 'denied' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-warning)]'
                      }`}></div>
                    <span className="text-sm text-[var(--color-text-light)]">
                      {notificationPermission === 'granted' && '通知が有効です'}
                      {notificationPermission === 'denied' && '通知が無効です'}
                      {notificationPermission === 'default' && '通知の許可が必要です'}
                    </span>
                  </div>
                </div>

                {/* リマインド設定コンポーネント */}
                <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg p-6">
                  <ReminderSettings />
                </div>

                {/* 通知許可プロンプト */}
                {showNotificationPrompt && (
                  <div className="mt-6">
                    <NotificationPrompt
                      onPermissionResult={(granted) => {
                        if (granted) {
                          handleNotificationPermissionGranted()
                        } else {
                          handleNotificationPermissionDenied()
                        }
                      }}
                      autoShow={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  )
}
