'use client'

import { useState } from 'react'
import { ChatMessage } from '../../types/api'
import ChatView from '../../components/common/ChatView'
import MessageInput from '../../components/common/MessageInput'
import Header from '../../components/common/Header'
import Navigation from '../../components/common/Navigation'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: message }],
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // モック応答
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: `「${message}」についてですね。どのような質問がありますか？` }],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
      <Header onMenuClick={() => setIsNavOpen(true)} />
      <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Chat Content */}
        <div className="flex-1 flex flex-col pt-16 min-h-0">
          <div className="flex-1 overflow-hidden">
            <ChatView messages={messages} isLoading={isLoading} />
          </div>

          {/* Fixed Message Input at Bottom */}
          <div className="flex-shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-light)]">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                placeholder="質問や問題を入力してください..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
