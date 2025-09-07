'use client'

import { useState, useEffect } from 'react'
import ChatView from '../../components/common/ChatView'
import MessageInput from '../../components/common/MessageInput'
import { ChatMessage } from '../../types/api'
import { apiClient } from '../../lib/apiClient'
import { useChatStore } from '../../store/chatStore'
import { auth } from '../../lib/firebase'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const { currentSession, setCurrentSession, addMessage, setLoading, setError, clearError } = useChatStore()

  useEffect(() => {
    // 認証状態のチェック
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user)
      if (user && !currentSessionId) {
        // 新しいセッションを作成
        createNewSession()
      }
    })

    return () => unsubscribe()
  }, [])

  const createNewSession = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await apiClient.createSession('AI学習サポート')
      setCurrentSessionId(response.sessionId)
      console.log('New session created:', response.sessionId)
    } catch (error) {
      console.error('Error creating session:', error)
      setError('セッションの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !currentSessionId) return

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: message }],
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    addMessage(userMessage)
    setIsLoading(true)
    clearError()

    try {
      // API経由でメッセージを送信
      const response = await apiClient.sendMessage(currentSessionId, message)

      // AIメッセージを作成
      const aiMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: response.response }],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      addMessage(aiMessage)
    } catch (error) {
      console.error('Error sending message:', error)
      setError('メッセージの送信に失敗しました')
      // エラーメッセージを追加
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: '申し訳ありません。メッセージの送信に失敗しました。もう一度お試しください。' }],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">AI学習サポート</h1>
              <p className="text-sm text-gray-600">わからない問題を入力してください。AIがヒントを提供します。</p>
            </div>
            <a
              href="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              ホーム
            </a>
          </div>
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
