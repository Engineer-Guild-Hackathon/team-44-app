'use client'

import { useState, useEffect } from 'react'

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
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // カレンダー表示用の日付計算
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()
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

  // 学習記録を取得
  const fetchLearningRecords = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: API呼び出しを実装
      console.log('Fetching learning records...')
      // const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
      // const response = await fetch(`${API_BASE_URL}/learningRecords`)
      // const data = await response.json()
      // if (data.success) {
      //   setLearningRecords(data.data)
      // }

      // デモ用のダミーデータ
      setLearningRecords([])
    } catch (err) {
      setError('学習記録の取得に失敗しました')
      console.error('Error fetching learning records:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLearningRecords()
  }, [])

  // 指定した日付の学習記録を取得
  const getRecordsForDate = (date: Date): LearningRecord[] => {
    return learningRecords.filter(record => {
      const recordDate = new Date(record.completedAt)
      return recordDate.toDateString() === date.toDateString()
    })
  }

  // 月を変更
  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + delta)
    setSelectedDate(newDate)
  }

  // 教科別の色分け
  const getSubjectColor = (subject: string): string => {
    const colors: { [key: string]: string } = {
      'math': 'bg-blue-100 text-blue-800',
      'science': 'bg-green-100 text-green-800',
      'english': 'bg-purple-100 text-purple-800',
      'history': 'bg-orange-100 text-orange-800',
      'programming': 'bg-red-100 text-red-800',
      'general': 'bg-gray-100 text-gray-800'
    }
    return colors[subject] || colors['general']
  }

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">エラーが発生しました</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              学習カレンダー
            </h1>
            <nav className="flex space-x-4">
              <a href="/chat" className="text-gray-600 hover:text-gray-900">
                チャット
              </a>
              <a href="/reminders" className="text-gray-600 hover:text-gray-900">
                リマインド設定
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* カレンダーヘッダー */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex items-center justify-between p-6">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h2 className="text-xl font-semibold text-gray-900">
                {currentYear}年 {monthNames[currentMonth]}
              </h2>

              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-0 border-t">
              {dayNames.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50">
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
                    className={`min-h-24 p-2 border-t border-r border-gray-200 ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>

                    {/* 学習記録表示 */}
                    <div className="space-y-1">
                      {records.slice(0, 3).map((record) => (
                        <div
                          key={record.id}
                          className={`text-xs px-2 py-1 rounded ${getSubjectColor(record.subject)}`}
                          title={`${record.topic} (${record.duration}分)`}
                        >
                          <div className="truncate">
                            {record.topic}
                          </div>
                        </div>
                      ))}
                      {records.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {learningRecords.length}
              </div>
              <div className="text-sm text-gray-600">総学習記録数</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {learningRecords.reduce((sum, record) => sum + record.duration, 0)}
              </div>
              <div className="text-sm text-gray-600">総学習時間（分）</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(learningRecords.map(r => r.subject)).size}
              </div>
              <div className="text-sm text-gray-600">学習教科数</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(learningRecords.reduce((sum, record) => sum + record.duration, 0) / Math.max(learningRecords.length, 1))}
              </div>
              <div className="text-sm text-gray-600">平均学習時間（分）</div>
            </div>
          </div>

          {/* 教科別凡例 */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">教科別カラー</h3>
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
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
