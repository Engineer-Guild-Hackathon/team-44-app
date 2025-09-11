'use client'

import { useState, useEffect } from 'react'
import { ChatSession, LearningRecord } from '../../types/api'
import { apiClient } from '../../lib/apiClient'

interface ChatHistoryModalProps {
  learningRecordId: string
  onClose: () => void
}

export function ChatHistoryModal({ learningRecordId, onClose }: ChatHistoryModalProps) {
  const [learningRecord, setLearningRecord] = useState<LearningRecord | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLearningRecordAndSessions()
  }, [learningRecordId])

  const fetchLearningRecordAndSessions = async () => {
    try {
      setIsLoading(true)

      // 学習記録を取得
      const record = await apiClient.getLearningRecord(learningRecordId)
      setLearningRecord(record)

      // 関連するセッションを取得 (現在のAPIでは直接的な方法がないため、
      // 全セッションを取得してフィルタリング)
      const allSessions = await apiClient.getUserSessions()
      const relatedSessions = allSessions.filter(session =>
        session.learningRecordId === learningRecordId
      )
      setSessions(relatedSessions)

      // 最初のセッションを選択
      if (relatedSessions.length > 0) {
        setSelectedSession(relatedSessions[0])
      }

    } catch (error) {
      console.error('Error fetching learning record and sessions:', error)
      setError('学習記録の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const startReview = () => {
    // 復習モードでチャットページに遷移
    window.location.href = `/chat?learningRecord=${learningRecordId}`
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-700">読み込み中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !learningRecord) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error || '学習記録が見つかりません'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">

        {/* 左サイドバー: セッション一覧 */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">セッション一覧</h3>
            <div className="text-sm text-gray-600">
              {sessions.length}個のセッション
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                セッションがありません
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedSession?.id === session.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm truncate mb-1">
                      {session.title || '無題のセッション'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(session.startedAt)} {formatTime(session.startedAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.duration}分 • {session.messageCount}メッセージ
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col">
          {/* ヘッダー */}
          <div className="bg-blue-50 p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {learningRecord.subject} - {learningRecord.topic}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>累計{learningRecord.totalDuration}分</span>
                  <span>{learningRecord.sessionCount}セッション</span>
                  <span>レベル{learningRecord.difficulty}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 学習サマリー */}
            {learningRecord.summary && (
              <div className="p-4 bg-white rounded border">
                <h3 className="font-medium text-gray-900 mb-2">学習サマリー</h3>
                <p className="text-sm text-gray-700 mb-3">
                  {learningRecord.summary}
                </p>

                {learningRecord.keyPoints && learningRecord.keyPoints.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">重要ポイント:</div>
                    <div className="flex flex-wrap gap-1">
                      {learningRecord.keyPoints.map((point, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* チャット履歴 */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSession ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  {selectedSession.title} の対話履歴
                </h3>
                <div className="space-y-4">
                  {selectedSession.messages && selectedSession.messages.length > 0 ? (
                    selectedSession.messages.map((message, index) => (
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
                          <div className="text-sm whitespace-pre-wrap">
                            {message.parts[0]?.text || ''}
                          </div>
                          {message.timestamp && (
                            <div className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      メッセージがありません
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                左側からセッションを選択してください
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="bg-gray-50 p-6 border-t">
            <div className="flex space-x-3">
              <button
                onClick={startReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                この内容を復習する
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
