'use client'

import { useState, useEffect } from 'react'
import { ChatMessage } from '../../types/api'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // モック応答を生成する関数
  const getMockResponse = (userMessage: string): string => {
    const responses = [
      `「${userMessage}」についてですね。まず、この問題を解決するために、どのようなアプローチを考えますか？`,
      `いい質問ですね。「${userMessage}」について考えてみましょう。基本的な概念から確認してみませんか？`,
      `「${userMessage}」という問題は、段階的に考えるとわかりやすいかもしれません。まず、どの部分が難しいですか？`,
      `それは重要なポイントですね。「${userMessage}」について、具体例を挙げて考えてみましょう。`,
      `「${userMessage}」についてお手伝いします。自分で解いてみる前に、どのような手がかりがあるか考えてみてください。`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // バックエンドのヘルスチェック
  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`)
      if (response.ok) {
        const data = await response.json()
        console.log('Backend health check:', data)
        return data
      } else {
        console.error('Backend health check failed:', response.status)
        return null
      }
    } catch (error) {
      console.error('Backend health check error:', error)
      return null
    }
  }

  // セッション作成
  const createNewSession = async () => {
    if (isCreatingSession) return // 既に作成中ならスキップ

    setIsCreatingSession(true)
    try {
      console.log('Creating new session...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatSessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'AI学習サポート' }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSessionId(data.sessionId)
        console.log('New session created:', data.sessionId)
        return data.sessionId
      } else {
        console.error('Failed to create session:', response.status, response.statusText)
        throw new Error(`セッション作成に失敗しました (${response.status})`)
      }
    } catch (error) {
      console.error('Error creating session:', error)
      // APIが利用できない場合はデモモード
      const demoSessionId = `demo-${Date.now()}`
      setCurrentSessionId(demoSessionId)
      console.log('Backend LLM service is not available. Using demo mode for AI responses.')
      console.log('Demo session created:', demoSessionId)
      return demoSessionId
    } finally {
      setIsCreatingSession(false)
    }
  }

    // メッセージ送信
  const handleSendMessage = async () => {
    if (!message.trim()) return

    // セッションが存在しない場合は作成
    let sessionId = currentSessionId
    if (!sessionId) {
      console.log('No session found, creating new session...')
      sessionId = await createNewSession()
      if (!sessionId) {
        console.error('Failed to create session')
        return
      }
    }

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: message }],
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    const currentMessage = message
    setMessage('') // すぐにクリア

    try {
      console.log('Sending message to session:', sessionId)

      // デモセッションの場合はモック応答を返す
      if (sessionId.startsWith('demo-')) {
        console.log('Using demo mode for AI response')
        await new Promise(resolve => setTimeout(resolve, 1500)) // シミュレーション遅延

        const mockResponse = getMockResponse(currentMessage)
        const aiMessage: ChatMessage = {
          role: 'model',
          parts: [{ text: mockResponse }],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        console.log('Demo AI response:', mockResponse)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatSessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: ChatMessage = {
          role: 'model',
          parts: [{ text: data.response }],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        console.log('AI response received:', data.response)
      } else {
        console.error('API error:', response.status, response.statusText)
        console.log('Backend LLM service is not available. Switching to demo mode.')
        // APIが利用できない場合はデモモードで応答
        await new Promise(resolve => setTimeout(resolve, 1500)) // シミュレーション遅延
        const mockResponse = getMockResponse(currentMessage)
        const aiMessage: ChatMessage = {
          role: 'model',
          parts: [{ text: mockResponse }],
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        console.log('Demo AI response:', mockResponse)
        return
      }
    } catch (error) {
      console.error('Error sending message:', error)
      console.log('Backend LLM service is not available. Switching to demo mode.')
      // APIが利用できない場合はデモモードで応答
      await new Promise(resolve => setTimeout(resolve, 1500)) // シミュレーション遅延
      const mockResponse = getMockResponse(currentMessage)
      const aiMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: mockResponse }],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      console.log('Demo AI response:', mockResponse)
      return
    } finally {
      setIsLoading(false)
    }
  }

  // 初期化
  useEffect(() => {
    console.log('Initializing chat page...')
    checkBackendHealth()
    createNewSession()
  }, [])

  // デバッグ用：状態確認
  useEffect(() => {
    console.log('Current state:', {
      message: message.length,
      currentSessionId,
      isLoading,
      isCreatingSession,
      messagesCount: messages.length
    })
  }, [message, currentSessionId, isLoading, isCreatingSession, messages])

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
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-100 ml-12'
                  : 'bg-gray-100 mr-12'
              }`}>
                <div className="text-sm text-gray-600 mb-1">
                  {msg.role === 'user' ? 'あなた' : 'AI'}
                </div>
                {msg.parts[0].text}
              </div>
            ))}
            {isLoading && (
              <div className="mb-4 p-3 bg-gray-100 mr-12 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">AI</div>
                考え中...
              </div>
            )}
          </div>

          {/* メッセージ入力 */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading && message.trim()) {
                    handleSendMessage()
                  }
                }}
                placeholder="質問や問題を入力してください..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '送信中...' : '送信'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
