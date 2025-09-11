'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/common/Header'
import Navigation from '../../components/common/Navigation'
import { CalendarGrid } from '../../components/calendar/CalendarGrid'
import { LearningRecordList } from '../../components/calendar/LearningRecordList'
import { ChatHistoryModal } from '../../components/calendar/ChatHistoryModal'
import { useAuth } from '../../hooks/useAuth'
import apiClient from '../../lib/apiClient'
import { LearningRecord } from '../../types/api'

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNavOpen, setIsNavOpen] = useState(true)

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

  const handleRecordSelect = (recordId: string) => {
    setSelectedRecordId(recordId)
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
      <Header user={user} onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
      {user && <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1">
        <main className={`pt-16 pb-20 md:pb-6 px-4 sm:px-6 lg:px-8 ${isNavOpen ? 'max-w-7xl mx-auto' : 'md:max-w-7xl md:mx-auto'}`}>
          <div className="py-6">
            <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-8">学習カレンダー</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* カレンダーグリッド */}
              <div className="lg:col-span-2">
                <CalendarGrid
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  learningRecords={learningRecords}
                  isLoading={isLoading}
                />
              </div>

              {/* 選択日の学習記録一覧 */}
              <div className="lg:col-span-1">
                <LearningRecordList
                  date={selectedDate}
                  records={getDayRecords(selectedDate)}
                  onRecordSelect={handleRecordSelect}
                />
              </div>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
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
                  {learningRecords.reduce((sum, record) => sum + record.sessionCount, 0)}
                </div>
                <div className="text-sm text-[var(--color-muted-foreground)]">総セッション数</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* チャット履歴モーダル */}
      {selectedRecordId && (
        <ChatHistoryModal
          learningRecordId={selectedRecordId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
