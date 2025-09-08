'use client'

import { useState, useEffect } from 'react'
import { ReminderSettings } from '@/components/common/ReminderSettings'
import { NotificationPrompt } from '@/components/common/NotificationPrompt'

interface ReminderPageProps {
  // 必要に応じてpropsを追加
}

export default function RemindersComponent() {
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            リマインド設定
          </h1>
          <p className="text-gray-600">
            学習継続をサポートするリマインド通知の設定を管理できます
          </p>
        </div>

        {/* 通知権限のステータス表示 */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">通知の状態</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              notificationPermission === 'granted' ? 'bg-green-500' : 
              notificationPermission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {notificationPermission === 'granted' && '通知が有効です'}
              {notificationPermission === 'denied' && '通知が無効です'}
              {notificationPermission === 'default' && '通知の許可が必要です'}
            </span>
          </div>
        </div>

        {/* リマインド設定コンポーネント */}
        <ReminderSettings />

        {/* 通知許可プロンプト */}
        {showNotificationPrompt && (
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
        )}
      </div>
    </div>
  )
}
