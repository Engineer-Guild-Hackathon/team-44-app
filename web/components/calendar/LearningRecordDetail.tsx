'use client'

import { useState, useEffect } from 'react'
import { LearningRecord, ChatSession } from '../../types/api'
import apiClient from '../../lib/apiClient'

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
  const getSubjectIcon = (subject: string): string => {
    const icons: { [key: string]: string } = {
      'math': '📐',
      'science': '🔬',
      'english': '🔤',
      'history': '📚',
      'programming': '💻',
      'general': '📝'
    }
    return icons[subject] || icons['general']
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {record && (
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getSubjectIcon(record.subject)}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {record.subject} - {record.topic}
                  </h2>
                  <p className="text-sm text-gray-500">
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
        <div className="flex h-full">
          {/* 左パネル: セッション一覧 */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">セッション一覧</h3>
              <p className="text-sm text-gray-500">{sessions.length}セッション</p>
            </div>
            
            <div className="overflow-y-auto h-full pb-32">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-600">
                  {error}
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  セッションが見つかりません
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {sessions.map((session, index) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSession?.id === session.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            セッション{index + 1}
                          </span>
                          {session.status === 'completed' && (
                            <span className="text-green-500">✅</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(session.startedAt).toLocaleString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {session.completedAt && ` - ${new Date(session.completedAt).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}`}
                      </div>
                      {session.title && (
                        <div className="text-xs text-gray-600 mt-1 truncate">
                          {session.title}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右パネル: チャット履歴 */}
          <div className="flex-1 flex flex-col">
            {selectedSession ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="font-medium text-gray-900">
                    {selectedSession.title || `セッション${sessions.indexOf(selectedSession) + 1}`}
                  </h3>
                  <p className="text-sm text-gray-500">
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
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.parts[0]?.text || ''}
                        </div>
                        {message.timestamp && (
                          <div className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
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
              <div className="flex-1 flex items-center justify-center text-gray-500">
                セッションを選択してください
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* 学習サマリー */}
            {record && (
              <div className="flex-1">
                {record.summary && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">学習サマリー:</span> {record.summary}
                  </div>
                )}
                {record.keyPoints && record.keyPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {record.keyPoints.slice(0, 4).map((point, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                      >
                        {point}
                      </span>
                    ))}
                    {record.keyPoints.length > 4 && (
                      <span className="text-xs text-gray-500">
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
              className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              続きから学習
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}