'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/common/Header'
import Navigation from '../../components/common/Navigation'

interface LearningRecord {
  id: string
  userId: string
  sessionId: string
  subject: string
  topic: string
  summary: string
  duration: number
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNavOpen, setIsNavOpen] = useState(false)

  // 月の学習記録を取得
  const fetchMonthlyRecords = async (date: Date) => {
    setIsLoading(true)
    setError(null)

    try {
      const year = date.getFullYear()
      const month = date.getMonth()
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)

      const records = await apiClient.getLearningRecordsForPeriod(startDate, endDate)
      setLearningRecords(records)
    } catch (error) {
      console.error('Failed to fetch learning records:', error)
      setError('学習記録の取得に失敗しました')
      setLearningRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  // 選択日の学習記録をフィルタリング
  const getDayRecords = (date: Date) => {
    return learningRecords.filter(record => {
      const recordDate = new Date(record.lastStudiedAt)
      return recordDate.toDateString() === date.toDateString()
    })
  }

  // 月が変わった時に記録を取得
  useEffect(() => {
    fetchMonthlyRecords(selectedDate)
  }, [selectedDate.getMonth(), selectedDate.getFullYear()])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // 教科別の色分け（Librariaテーマ対応）
  const getSubjectColor = (subject: string): string => {
    const colors: { [key: string]: string } = {
      'math': 'bg-[var(--color-accent)] bg-opacity-20 text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30',
      'science': 'bg-[var(--color-primary)] bg-opacity-20 text-[var(--color-primary)] border border-[var(--color-primary)] border-opacity-30',
      'english': 'bg-[var(--color-secondary)] bg-opacity-20 text-[var(--color-secondary)] border border-[var(--color-secondary)] border-opacity-30',
      'history': 'bg-[var(--color-tertiary)] bg-opacity-20 text-[var(--color-tertiary)] border border-[var(--color-tertiary)] border-opacity-30',
      'programming': 'bg-[var(--color-error)] bg-opacity-20 text-[var(--color-error)] border border-[var(--color-error)] border-opacity-30',
      'general': 'bg-[var(--color-muted-foreground)] bg-opacity-20 text-[var(--color-muted-foreground)] border border-[var(--color-muted-foreground)] border-opacity-30'
    }
    return colors[subject] || colors['general']
  }

  const handleCloseModal = () => {
    setSelectedRecordId(null)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[var(--color-error)] text-lg mb-4">エラーが発生しました</div>
          <div className="text-[var(--color-muted-foreground)]">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
      <Header onMenuClick={() => setIsNavOpen(true)} />
      <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 md:ml-80">
        {/* メインコンテンツ */}
        <main className="pt-16 pb-20 md:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="py-6">
            {/* カレンダーヘッダー */}
            <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg mb-6 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-3 hover:bg-[var(--color-accent)] hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <h2 className="text-xl font-semibold text-[var(--color-text-light)]">
                  {currentYear}年 {monthNames[currentMonth]}
                </h2>

                <button
                  onClick={() => changeMonth(1)}
                  className="p-3 hover:bg-[var(--color-accent)] hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 gap-0 border-b border-[var(--color-border)]">
                {dayNames.map((day) => (
                  <div key={day} className="p-4 text-center text-sm font-medium text-[var(--color-text-light)] bg-[var(--color-bg-light)] border-r border-[var(--color-border)] last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* カレンダーグリッド */}
              <div className="grid grid-cols-7 gap-0">
                {days.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentMonth
                  const isToday = day.toDateString() === new Date().toDateString()
                  const records = getRecordsForDate(day)

                  return (
                    <div
                      key={index}
                      className={`min-h-28 p-3 border-r border-b border-[var(--color-border)] last:border-r-0 ${
                        isCurrentMonth ? 'bg-[var(--color-bg-light)]' : 'bg-[var(--color-bg-light)] opacity-50'
                      } ${isToday ? 'bg-[var(--color-accent)] bg-opacity-10' : ''} hover:bg-[var(--color-accent)] hover:bg-opacity-5 transition-colors`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isCurrentMonth ? 'text-[var(--color-text-light)]' : 'text-[var(--color-muted-foreground)]'
                      } ${isToday ? 'text-[var(--color-accent)] font-bold' : ''}`}>
                        {day.getDate()}
                      </div>

                      {/* 学習記録表示 */}
                      <div className="space-y-1">
                        {records.slice(0, 3).map((record) => (
                          <div
                            key={record.id}
                            className={`text-xs px-2 py-1 rounded-md ${getSubjectColor(record.subject)}`}
                            title={`${record.topic} (${record.duration}分)`}
                          >
                            <div className="truncate">
                              {record.topic}
                            </div>
                          </div>
                        ))}
                        {records.length > 3 && (
                          <div className="text-xs text-[var(--color-muted-foreground)] px-2">
                            +{records.length - 3}件
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-[var(--color-accent)] mb-2">
                  {learningRecords.length}
                </div>
                <div className="text-sm text-[var(--color-muted-foreground)]">総学習記録数</div>
              </div>

              <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                  {learningRecords.reduce((sum, record) => sum + record.duration, 0)}
                </div>
                <div className="text-sm text-[var(--color-muted-foreground)]">総学習時間（分）</div>
              </div>

              <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-[var(--color-secondary)] mb-2">
                  {new Set(learningRecords.map(r => r.subject)).size}
                </div>
                <div className="text-sm text-[var(--color-muted-foreground)]">学習教科数</div>
              </div>

              <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-[var(--color-tertiary)] mb-2">
                  {Math.round(learningRecords.reduce((sum, record) => sum + record.duration, 0) / Math.max(learningRecords.length, 1))}
                </div>
                <div className="text-sm text-[var(--color-muted-foreground)]">平均学習時間（分）</div>
              </div>
            </div>

            {/* 教科別凡例 */}
            <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">教科別カラー</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'math', label: '数学' },
                  { key: 'science', label: '理科' },
                  { key: 'english', label: '英語' },
                  { key: 'history', label: '歴史' },
                  { key: 'programming', label: 'プログラミング' },
                  { key: 'general', label: 'その他' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${getSubjectColor(key)}`}></div>
                    <span className="text-sm text-[var(--color-text-light)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">学習分野数</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {learningRecords.reduce((sum, record) => sum + record.sessionCount, 0)}
            </div>
            <div className="text-sm text-gray-600">総セッション数</div>
          </div>
        </main>
      </div>
    </div>
  )
}
