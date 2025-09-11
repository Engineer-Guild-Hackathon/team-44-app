'use client'

import { useState, useEffect } from 'react'
import { NotificationPrompt } from '../../components/common/NotificationPrompt'
import { notificationService } from '../../lib/notificationService'

export default function NotificationDemoPage() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(notificationService.isSupported())
    setPermissionStatus(notificationService.getPermissionStatus())
  }, [])

  const handleShowPrompt = () => {
    setShowPrompt(true)
  }

  const handlePermissionResult = (granted: boolean) => {
    setShowPrompt(false)
    setPermissionStatus(notificationService.getPermissionStatus())
    
    if (granted) {
      console.log('Permission granted!')
    }
  }

  const handleTestNotification = () => {
    notificationService.sendLocalNotification('テスト通知', {
      body: 'これはテスト通知です。PWA通知機能が正常に動作しています。',
      tag: 'test-notification'
    })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8">
          通知機能デモ
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">通知サポート状況</h2>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">ブラウザサポート:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isSupported 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isSupported ? 'サポート済み' : 'サポートなし'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="font-medium">通知許可状態:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                permissionStatus === 'granted' 
                  ? 'bg-green-100 text-green-800'
                  : permissionStatus === 'denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {permissionStatus === 'granted' ? '許可済み' :
                 permissionStatus === 'denied' ? '拒否済み' : '未設定'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={handleShowPrompt}
                disabled={!isSupported || permissionStatus !== 'default'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                通知許可を求める
              </button>
              <p className="text-sm text-gray-600 mt-1">
                {permissionStatus === 'default' 
                  ? '通知許可プロンプトを表示します'
                  : '既に許可/拒否が設定されています'}
              </p>
            </div>

            <div>
              <button
                onClick={handleTestNotification}
                disabled={!isSupported || permissionStatus !== 'granted'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                テスト通知を送信
              </button>
              <p className="text-sm text-gray-600 mt-1">
                {permissionStatus === 'granted'
                  ? 'ローカル通知を送信します'
                  : '通知許可が必要です'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">実装内容</h2>
          
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ Firebase Messaging Service Worker 設定</li>
            <li>✅ 通知許可プロンプトコンポーネント</li>
            <li>✅ ローカル通知送信機能</li>
            <li>✅ FCMトークン取得機能</li>
            <li>✅ バックグラウンド通知処理</li>
            <li>✅ 通知アクション処理（復習する/後で）</li>
            <li>✅ PWA manifest.json 設定</li>
            <li>✅ チャットページへの通知統合</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/chat"
            className="inline-block px-6 py-3 bg-[var(--color-primary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-accent)] transition-colors"
          >
            チャットページに戻る
          </a>
        </div>
      </div>

      {/* Notification Permission Prompt */}
      {showPrompt && (
        <NotificationPrompt
          onPermissionResult={handlePermissionResult}
          autoShow={false}
        />
      )}
    </div>
  )
}