'use client'

import { useState, useEffect } from 'react'
import { LearningRecord, ChatSession } from '../../types/api'
import apiClient from '../../lib/apiClient'
import { MdCalculate, MdScience, MdLanguage, MdHistory, MdCode, MdMenuBook, MdExpandMore } from 'react-icons/md'

interface LearningRecordDetailProps {
  isOpen: boolean
  onClose: () => void
  recordId: string
  onContinueLearning: (recordId: string) => void
}

export default function LearningRecordDetail({
  isOpen,
  onClose,
  recordId,
  onContinueLearning
}: LearningRecordDetailProps) {
  const [record, setRecord] = useState<LearningRecord | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // データ取得
  useEffect(() => {
    if (isOpen && recordId) {
      fetchRecordDetails()
    }
  }, [isOpen, recordId])

  const fetchRecordDetails = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 学習記録の詳細を取得
      const recordData = await apiClient.getLearningRecord(recordId)
      setRecord(recordData)

      // 関連するセッションを取得
      const userSessions = await apiClient.getUserSessions()
      const relatedSessions = userSessions.filter(session =>
        session.learningRecordId === recordId
      ).sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())

      setSessions(relatedSessions)

      // 最初のセッションを選択
      if (relatedSessions.length > 0) {
        setSelectedSession(relatedSessions[0])
      }
    } catch (error) {
      console.error('Failed to fetch record details:', error)
      setError('学習記録の詳細を取得できませんでした')
    } finally {
      setIsLoading(false)
    }
  }

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // ドロップダウンの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // 時間を分から時間:分の形式に変換
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins}分`
    }
    return `${mins}分`
  }

  // 教科アイコンを取得
  const getSubjectIcon = (subject: string): JSX.Element => {
    const icons: { [key: string]: JSX.Element } = {
      'math': <MdCalculate />,
      'science': <MdScience />,
      'english': <MdLanguage />,
      'history': <MdHistory />,
      'programming': <MdCode />,
      'general': <MdMenuBook />
    }
    return icons[subject] || icons['general']
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-[var(--color-bg-light)] rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-accent)] hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {record && (
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getSubjectIcon(record.subject)}</span>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-text-light)]">
                    {record.subject} - {record.topic}
                  </h2>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    レベル{record.difficulty} • {formatDuration(record.totalDuration)} • {record.sessionCount}セッション
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="flex flex-col h-full">
          {/* セッション選択 */}
          <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-light)]">
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">セッションを選択:</label>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 text-left bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-opacity-50 transition-colors flex items-center justify-between"
              >
                <span className="text-[var(--color-text-light)]">
                  {selectedSession
                    ? `セッション${sessions.indexOf(selectedSession) + 1} - ${formatDuration(selectedSession.duration)} - ${new Date(selectedSession.startedAt).toLocaleString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}${selectedSession.title ? ` - ${selectedSession.title}` : ''}`
                    : 'セッションを選択してください'
                  }
                </span>
                <MdExpandMore className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="px-4 py-3 text-[var(--color-text-secondary)] text-sm">
                      セッションが見つかりません
                    </div>
                  ) : (
                    sessions.map((session, index) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setSelectedSession(session);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-[var(--color-accent)] hover:bg-opacity-10 transition-colors border-b border-[var(--color-border)] last:border-b-0 ${selectedSession?.id === session.id ? 'bg-[var(--color-accent)] bg-opacity-20' : ''
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-[var(--color-text-light)]">
                              セッション{index + 1}
                            </div>
                            <div className="text-sm text-[var(--color-text-secondary)]">
                              {formatDuration(session.duration)} • {new Date(session.startedAt).toLocaleString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {session.title && (
                                <div className="truncate text-xs mt-1">
                                  {session.title}
                                </div>
                              )}
                            </div>
                          </div>
                          {session.status === 'completed' && (
                            <span className="text-[var(--color-success)] ml-2">✅</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* チャット履歴 */}
          <div className="flex-1 flex flex-col">
            {selectedSession ? (
              <>
                <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-light)]">
                  <h3 className="font-medium text-[var(--color-text-light)]">
                    {selectedSession.title || `セッション${sessions.indexOf(selectedSession) + 1}`}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {new Date(selectedSession.startedAt).toLocaleString('ja-JP')} • {selectedSession.messageCount}メッセージ
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedSession.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                          ? 'bg-[var(--color-primary)] text-[var(--color-text-dark)]'
                          : 'bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-text-light)]'
                          }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.parts[0]?.text || ''}
                        </div>
                        {message.timestamp && (
                          <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-[var(--color-text-dark)] opacity-70' : 'text-[var(--color-text-secondary)]'
                            }`}>
                            {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)]">
                セッションを選択してください
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 bg-[var(--color-bg-light)] border-t border-[var(--color-border)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* 学習サマリー */}
            {record && (
              <div className="flex-1">
                {record.summary && (
                  <div className="text-sm text-[var(--color-text-secondary)] mb-2">
                    <span className="font-medium">学習サマリー:</span> {record.summary}
                  </div>
                )}
                {record.keyPoints && record.keyPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {record.keyPoints.slice(0, 4).map((point, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-text-light)]"
                      >
                        {point}
                      </span>
                    ))}
                    {record.keyPoints.length > 4 && (
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        +{record.keyPoints.length - 4}個
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 続きから学習ボタン */}
            <button
              onClick={() => onContinueLearning(recordId)}
              className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-accent)] transition-colors font-medium"
            >
              続きから学習
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
