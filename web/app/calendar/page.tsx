'use client'

import { useState, useEffect } from 'react'
import { CalendarGrid } from '../../components/calendar/CalendarGrid'
import { LearningRecordList } from '../../components/calendar/LearningRecordList'
import { ChatHistoryModal } from '../../components/calendar/ChatHistoryModal'
import { LearningRecord } from '../../types/api'
import { apiClient } from '../../lib/apiClient'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchMonthlyRecords(selectedDate)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">学習カレンダー</h1>
          <p className="text-gray-600">
            過去の学習記録を確認し、復習や継続学習に活用しましょう
          </p>
        </div>

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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {learningRecords.length}
            </div>
            <div className="text-sm text-gray-600">学習記録数</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {learningRecords.reduce((sum, record) => sum + record.totalDuration, 0)}
            </div>
            <div className="text-sm text-gray-600">総学習時間（分）</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(learningRecords.map(r => r.subject)).size}
            </div>
            <div className="text-sm text-gray-600">学習分野数</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {learningRecords.reduce((sum, record) => sum + record.sessionCount, 0)}
            </div>
            <div className="text-sm text-gray-600">総セッション数</div>
          </div>
        </div>

        {/* チャット履歴モーダル */}
        {selectedRecordId && (
          <ChatHistoryModal
            learningRecordId={selectedRecordId}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  )
}
