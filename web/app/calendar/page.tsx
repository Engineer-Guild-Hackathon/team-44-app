'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/common/Header'
import Navigation from '../../components/common/Navigation'
import DayRecordsModal from '../../components/calendar/DayRecordsModal'
import LearningRecordDetail from '../../components/calendar/LearningRecordDetail'
import { ErrorNavigationButtons } from '../../components/common/ErrorNavigationButtons'
import { useAuth } from '../../hooks/useAuth'
import apiClient from '../../lib/apiClient'
import { LearningRecord } from '../../types/api'

export default function CalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNavOpen, setIsNavOpen] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all') // 'all', 'active', 'completed'

  // Modal states
  const [showDayModal, setShowDayModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [dayRecords, setDayRecords] = useState<LearningRecord[]>([])
  const [detailRecordId, setDetailRecordId] = useState<string | null>(null)

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // ルートが変わったら自動でサイドバーを閉じる
  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  // カレンダー関連の定数
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  // カレンダーの日付配列を生成
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const days = generateCalendarDays()

  // 月を変更する関数
  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setSelectedDate(newDate)
  }

  // 日付の学習記録を取得（フィルタ適用）
  const getRecordsForDate = (date: Date) => {
    return learningRecords.filter(record => {
      const recordDate = new Date(record.lastStudiedAt)
      const dateMatches = recordDate.toDateString() === date.toDateString()
      const statusMatches = statusFilter === 'all' || record.status === statusFilter
      return dateMatches && statusMatches
    })
  }

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
      const dateMatches = recordDate.toDateString() === date.toDateString()
      const statusMatches = statusFilter === 'all' || record.status === statusFilter
      return dateMatches && statusMatches
    })
  }

  // 月が変わった時に記録を取得
  useEffect(() => {
    fetchMonthlyRecords(selectedDate)
  }, [selectedDate.getMonth(), selectedDate.getFullYear()])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // 日付クリック時のハンドラー（モーダル表示）
  const handleDateClick = (date: Date, records: LearningRecord[]) => {
    setClickedDate(date)
    setDayRecords(records)
    setShowDayModal(true)
  }

  // 学習記録選択時のハンドラー（詳細モーダル表示）
  const handleRecordSelect = (recordId: string) => {
    setDetailRecordId(recordId)
    setShowDayModal(false)
    setShowDetailModal(true)
  }

  // 続きから学習ボタンのハンドラー
  const handleContinueLearning = (recordId: string) => {
    // チャットページにリダイレクト
    window.location.href = `/chat?recordId=${recordId}`
  }

  // モーダルを閉じる
  const closeDayModal = () => {
    setShowDayModal(false)
    setClickedDate(null)
    setDayRecords([])
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setDetailRecordId(null)
  }

  // 教科別の色分け（tothlusテーマ対応）
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
      <div className="min-h-screen bg-[var(--color-bg-light)] flex">
        <Header onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
        <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <img src="/icon-192.svg" alt="tothlus logo" className="w-16 h-16" />
              </div>
              <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
                エラーが発生しました
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                {error}
              </p>
            </div>

            <ErrorNavigationButtons
              showRetry={false}
              homeLabel="ホームに戻る"
              loginLabel="ログイン画面へ"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
      <Header user={user} onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
      {user && <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1">
        {!user ? (
          <div className="flex items-center justify-center h-full pt-16">
            <div className="text-center max-w-md mx-auto px-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                ログインが必要です
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                カレンダー機能を利用するには、ログインしてください。
              </p>
              <a
                href="/auth"
                className="inline-block bg-[var(--color-primary)] text-[var(--color-text-dark)] px-6 py-2 rounded-lg hover:bg-[var(--color-accent)] transition-colors"
              >
                ログインする
              </a>
            </div>
          </div>
        ) : (
          <main className="pt-16 pb-20 md:pb-6 px-4 sm:px-6 lg:px-8 md:max-w-7xl md:mx-auto">
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
                      <button
                        key={index}
                        onClick={() => records.length > 0 && handleDateClick(day, records)}
                        className={`min-h-28 p-3 border-r border-b border-[var(--color-border)] last:border-r-0 ${isCurrentMonth ? 'bg-[var(--color-bg-light)]' : 'bg-[var(--color-bg-light)] opacity-50'
                          } ${isToday ? 'bg-[var(--color-accent)] bg-opacity-10' : ''} ${records.length > 0 ? 'hover:bg-[var(--color-accent)] hover:bg-opacity-5 cursor-pointer' : 'cursor-default'} transition-colors text-left`}
                      >
                        <div className={`text-sm font-medium mb-2 ${isCurrentMonth ? 'text-[var(--color-text-light)]' : 'text-[var(--color-muted-foreground)]'
                          } ${isToday ? 'text-[var(--color-accent)] font-bold' : ''}`}>
                          {day.getDate()}
                        </div>

                        {/* 学習記録表示 */}
                        <div className="space-y-1">
                          {records.slice(0, 3).map((record) => (
                            <div
                              key={record.id}
                              className={`text-xs px-2 py-1 rounded-md ${getSubjectColor(record.subject)}`}
                              title={`${record.topic} (${record.totalDuration}分)`}
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
                      </button>
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
                    {learningRecords.reduce((sum, record) => sum + record.totalDuration, 0)}
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
                    {Math.round(learningRecords.reduce((sum, record) => sum + record.totalDuration, 0) / Math.max(learningRecords.length, 1))}
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
            </div>
          </main>
        )}
      </div>

      {/* モーダル */}
      {showDayModal && clickedDate && (
        <DayRecordsModal
          isOpen={showDayModal}
          onClose={closeDayModal}
          date={clickedDate}
          records={dayRecords}
          onRecordSelect={handleRecordSelect}
        />
      )}

      {showDetailModal && detailRecordId && (
        <LearningRecordDetail
          isOpen={showDetailModal}
          onClose={closeDetailModal}
          recordId={detailRecordId}
          onContinueLearning={handleContinueLearning}
        />
      )}
    </div>
  )
}
