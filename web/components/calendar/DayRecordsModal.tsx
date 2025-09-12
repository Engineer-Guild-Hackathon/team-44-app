'use client'

import { useEffect } from 'react'
import { LearningRecord } from '../../types/api'
import { MdCalculate, MdScience, MdLanguage, MdHistory, MdCode, MdMenuBook } from 'react-icons/md'

interface DayRecordsModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  records: LearningRecord[]
  onRecordSelect: (recordId: string) => void
}

export default function DayRecordsModal({
  isOpen,
  onClose,
  date,
  records,
  onRecordSelect
}: DayRecordsModalProps) {
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

  // 教科別の色分け
  const getSubjectColor = (subject: string): string => {
    const colors: { [key: string]: string } = {
      'math': 'bg-blue-100 text-blue-800 border-blue-200',
      'science': 'bg-purple-100 text-purple-800 border-purple-200',
      'english': 'bg-green-100 text-green-800 border-green-200',
      'history': 'bg-orange-100 text-orange-800 border-orange-200',
      'programming': 'bg-red-100 text-red-800 border-red-200',
      'general': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[subject] || colors['general']
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

  // 時間を分から時間:分の形式に変換
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins}分`
    }
    return `${mins}分`
  }

  // その日の統計を計算
  const dayStats = {
    totalTime: records.reduce((sum, record) => sum + record.totalDuration, 0),
    totalRecords: records.length,
    totalSessions: records.reduce((sum, record) => sum + record.sessionCount, 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-[var(--color-bg-light)] rounded-xl shadow-4xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-xl font-semibold text-[var(--color-text-light)]">
              {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日の学習記録
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {records.length}件の学習記録
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-accent)] hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {records.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-[var(--color-text-secondary)] text-4xl mb-4"><MdMenuBook /></div>
              <p className="text-[var(--color-text-secondary)]">この日の学習記録はありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border border-[var(--color-border)] rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-[var(--color-bg-light)]"
                  onClick={() => onRecordSelect(record.id)}
                >
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getSubjectIcon(record.subject)}</span>
                      <div>
                        <h4 className="font-medium text-[var(--color-text-light)]">
                          {record.topic}
                        </h4>
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getSubjectColor(record.subject)}`}>
                          {record.subject}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-[var(--color-text-secondary)]">
                      <div>レベル{record.difficulty}</div>
                      <div>{new Date(record.lastStudiedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  {/* サマリー */}
                  {record.summary && (
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">
                      {record.summary}
                    </p>
                  )}

                  {/* キーポイント */}
                  {record.keyPoints && record.keyPoints.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-[var(--color-text-secondary)] mb-1">学習ポイント:</div>
                      <div className="flex flex-wrap gap-1">
                        {record.keyPoints.slice(0, 3).map((point, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-text-light)]"
                          >
                            {point}
                          </span>
                        ))}
                        {record.keyPoints.length > 3 && (
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            +{record.keyPoints.length - 3}個
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 統計 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-[var(--color-text-secondary)]">
                      <span>⏱️ {formatDuration(record.totalDuration)}</span>
                      <span>💬 {record.sessionCount}セッション</span>
                    </div>
                    <button className="text-[var(--color-accent)] hover:text-[var(--color-primary)] text-sm font-medium">
                      詳細を見る →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        {records.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-light)] bg-opacity-50">
            <div className="flex items-center justify-between text-sm">
              <div className="text-[var(--color-text-secondary)]">
                <span className="font-medium">この日の統計:</span>
              </div>
              <div className="flex items-center space-x-4 text-[var(--color-text-secondary)]">
                <span>総時間: {formatDuration(dayStats.totalTime)}</span>
                <span>記録数: {dayStats.totalRecords}件</span>
                <span>セッション数: {dayStats.totalSessions}回</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
