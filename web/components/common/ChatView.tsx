'use client'

import { ChatMessage } from '../../types/api'

interface ChatViewProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

export default function ChatView({ messages, isLoading = false }: ChatViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-8">
          <p>新しい学習セッションを開始しましょう！</p>
          <p className="text-sm mt-2">わからない問題や疑問を入力してください。AIがヒントを提供します。</p>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 border'
            }`}
          >
            <div className="whitespace-pre-wrap">
              {message.parts.map((part, partIndex) => (
                <span key={partIndex}>{part.text}</span>
              ))}
            </div>
            {message.timestamp && (
              <div className={`text-xs mt-1 opacity-70`}>
                {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 border rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span>AIが考えています...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
