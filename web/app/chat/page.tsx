'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChatMessage } from '../../types/api'
import ChatView from '../../components/common/ChatView'
import MessageInput from '../../components/common/MessageInput'
import Header from '../../components/common/Header'
import Navigation from '../../components/common/Navigation'
import { useAuth } from '../../hooks/useAuth'
import { getAuthClient } from '../../lib/firebase'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // 認証トークンを取得する関数
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null
    try {
      const auth = await getAuthClient()
      const token = await user.getIdToken()
      return token
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }, [user])

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
  const checkBackendHealth = useCallback(async () => {
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
  }, [])

  // セッション作成
  const createNewSession = useCallback(async () => {
    if (isCreatingSession) return // 既に作成中ならスキップ

    // 認証状態を確認
    if (authLoading) {
      console.log('Auth is still loading, skipping session creation')
      return
    }

    if (!user) {
      console.log('User not authenticated, using demo mode')
      const demoSessionId = `demo-${Date.now()}`
      setCurrentSessionId(demoSessionId)
      console.log('Demo session created:', demoSessionId)
      return demoSessionId
    }

    setIsCreatingSession(true)
    try {
      console.log('Creating new session...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`)
      if (!response.ok) {
        throw new Error('Backend not available')
      }

      const token = await getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatSessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'AI学習サポート' }),
      })

      if (sessionResponse.ok) {
        const data = await sessionResponse.json()
        setCurrentSessionId(data.sessionId)
        console.log('New session created:', data.sessionId)
        return data.sessionId
      } else {
        console.error('Failed to create session:', sessionResponse.status, sessionResponse.statusText)
        throw new Error(`セッション作成に失敗しました (${sessionResponse.status})`)
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
  }, [isCreatingSession, getAuthToken, user, authLoading])

  // メッセージ送信
  const handleSendMessage = async (message: string) => {
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

      const token = await getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chatSessions/${sessionId}/messages`, {
        method: 'POST',
        headers,
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
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
  <Header user={user} onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
  {user && <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Content */}
        <div className="flex-1 flex flex-col pt-16 min-h-0">
          <div className="flex-1 overflow-hidden">
            {authLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
                  <p className="text-[var(--color-text-secondary)]">認証状態を確認中...</p>
                </div>
              </div>
            ) : !user ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto px-4">
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                    ログインが必要です
                  </h2>
                  <p className="text-[var(--color-text-secondary)] mb-6">
                    チャット機能を利用するには、ログインしてください。
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
              <ChatView messages={messages} isLoading={isLoading} />
            )}
          </div>

          {/* Fixed Message Input at Bottom */}
            <div className="fixed left-0 right-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg-light)]">
              <div className={`max-w-4xl mx-auto px-4 py-4`}>
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading || authLoading || !user}
                  placeholder={
                    !user
                      ? "ログインしてチャットを開始してください"
                      : "質問や問題を入力してください..."
                  }
                />
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
