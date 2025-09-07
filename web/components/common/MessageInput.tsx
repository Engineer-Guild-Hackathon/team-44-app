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
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        style={{ minHeight: '40px', maxHeight: '120px' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement
          target.style.height = 'auto'
          target.style.height = `${Math.min(target.scrollHeight, 120)}px`
        }}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        送信
      </button>
    </form>
  )
}
