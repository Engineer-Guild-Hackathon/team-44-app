'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { ChatMessage } from '../../../types/api'
import { KnowledgeItem } from '@/types/discovery'

interface ChatViewProps {
  messages: ChatMessage[]
  isLoading?: boolean
  todayKnowledge?: KnowledgeItem | null
}

export default function ChatView({ messages, isLoading = false, todayKnowledge }: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-[var(--color-muted-foreground)] py-12">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Image src="/icon-192.svg" alt="tothlus logo" width={64} height={64} className="w-16 h-16" />
          </div>
          {todayKnowledge ? (
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <span className="inline-block bg-[var(--color-info)] text-[var(--color-text-dark)] text-xs px-2 py-1 rounded-full mb-2">
                  {todayKnowledge.category}
                </span>
                <p className="text-[var(--color-text-light)] text-lg leading-relaxed mb-4">
                  {todayKnowledge.content}
                </p>
                {todayKnowledge.googleSearchQuery && (
                  <button
                    onClick={() => {
                      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(todayKnowledge.googleSearchQuery)}`;
                      window.open(searchUrl, '_blank');
                    }}
                    className="text-[var(--color-info)] hover:text-[var(--color-info-hover)] text-sm font-medium underline"
                  >
                    もっと詳しく調べる
                  </button>
                )}
              </div>
              <div className="border-t pt-4">
                <p className="text-sm">わからない問題や疑問を入力してください。AIがヒントを提供します。</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">知識の探求を始めましょう</p>
              <p className="text-sm">わからない問題や疑問を入力してください。AIがヒントを提供します。</p>
            </div>
          )}
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
        >
          <div
            className={`max-w-[85%] md:max-w-[70%] rounded-xl px-4 py-3 shadow-sm ${message.role === 'user'
              ? 'message-bubble-user'
              : 'message-bubble-ai'
              }`}
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.parts.map((part, partIndex) => (
                <span key={partIndex}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                      code: ({ children }) => <code className="bg-[var(--color-accent)] bg-opacity-10 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      pre: ({ children }) => <pre className="bg-[var(--color-accent)] bg-opacity-10 p-3 rounded-md overflow-x-auto text-xs font-mono mb-2">{children}</pre>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                    }}
                  >
                    {part.text}
                  </ReactMarkdown>
                </span>
              ))}
            </div>
            {message.timestamp && (
              <div className={`text-xs mt-2 opacity-70`}>
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
          <div className="message-bubble-ai max-w-[70%]">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-[var(--color-muted-foreground)]">考え中...</span>
            </div>
          </div>
        </div>
      )}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  )
}
