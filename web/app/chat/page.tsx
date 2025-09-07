'use client'

import { useState } from 'react'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, `You: ${message}`])
      setMessages(prev => [...prev, `AI: こんにちは！「${message}」についてお手伝いします。何か具体的な質問はありますか？`])
      setMessage('')
    }
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
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-100 rounded-lg">
                {msg}
              </div>
            ))}
          </div>

          {/* メッセージ入力 */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="質問や問題を入力してください..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                送信
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
