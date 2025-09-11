'use client'

import { useState } from 'react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({ onSendMessage, disabled = false, placeholder = "メッセージを入力してください..." }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="bg-[var(--color-bg-light)] p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="input-field resize-none w-full pr-12"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`
            }}
          />
          {message.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-[var(--color-muted-foreground)]">
              {message.length}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={`btn-primary flex items-center justify-center ${
            disabled || !message.trim()
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-105'
          }`}
          style={{ width: '48px', height: '48px' }}
          aria-label="送信"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  )
}
