'use client'

import { useState, useEffect } from 'react'
import ChatView from '../../components/common/ChatView'
import MessageInput from '../../components/common/MessageInput'
import { ChatMessage } from '../../types/api'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 認証状態のチェック（簡易版）
    // 実際の実装では useAuth フックを使用
    setIsAuthenticated(true) // デモ用に常にtrueに設定
  }, [])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: message }],
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // 簡易的なAI応答シミュレーション
      // 実際の実装では API クライアントを使用
      await new Promise(resolve => setTimeout(resolve, 1500)) // シミュレーション遅延

      const aiResponse: ChatMessage = {
        role: 'model',
        parts: [{ text: `「${message}」について考えてみましょう。まず、どの部分が特に分からないでしょうか？問題を小さく分けて考えてみませんか？` }],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      // エラーハンドリング
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">チャット機能を利用するにはログインしてください。</p>
          <a
            href="/auth"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログインページへ
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-sm">
        {/* ヘッダー */}
        <div className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">AI学習サポート</h1>
          <p className="text-sm text-gray-600">わからない問題を入力してください。AIがヒントを提供します。</p>
        </div>

        {/* チャット表示エリア */}
        <div className="h-[calc(100vh-200px)] flex flex-col">
          <ChatView messages={messages} isLoading={isLoading} />
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder="質問や問題を入力してください..."
          />
        </div>
      </div>
    </div>
  )
}
