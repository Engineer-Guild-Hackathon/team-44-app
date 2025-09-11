'use client'

import { useState } from 'react'
import { LearningRecord } from '../../types/api'

interface CalendarGridProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onDateClick: (date: Date, records: LearningRecord[]) => void
  learningRecords: LearningRecord[]
  isLoading: boolean
}

export function CalendarGrid({ selectedDate, onDateSelect, onDateClick, learningRecords, isLoading }: CalendarGridProps) {
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

  // 日付に学習記録があるかチェック
  const hasLearningRecord = (date: Date) => {
    return learningRecords.some(record => {
      const recordDate = new Date(record.lastStudiedAt)
      return recordDate.toDateString() === date.toDateString()
    })
  }

  // 日付の学習記録を取得
  const getRecordsForDate = (date: Date) => {
    return learningRecords.filter(record => {
      const recordDate = new Date(record.lastStudiedAt)
      return recordDate.toDateString() === date.toDateString()
    })
  }

  // 日付クリック処理
  const handleDateClick = (date: Date) => {
    const records = getRecordsForDate(date)
    onDateSelect(date)
    
    if (records.length > 0) {
      onDateClick(date, records)
    }
  }

  const moveMonth = (direction: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + direction)
    onDateSelect(newDate)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 relative">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => moveMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {currentYear}年 {currentMonth + 1}月
        </h2>
        
        <button
          onClick={() => moveMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth
          const isSelected = date.toDateString() === selectedDate.toDateString()
          const isToday = date.toDateString() === new Date().toDateString()
          const hasRecord = hasLearningRecord(date)
          const recordCount = getRecordsForDate(date).length

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                relative p-2 h-16 text-left rounded-lg transition-colors
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-50'}
                ${isToday ? 'bg-blue-50' : ''}
                ${hasRecord ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              <div className="text-sm font-medium">{date.getDate()}</div>

              {/* 学習記録インジケーター */}
              {hasRecord && (
                <div className="absolute bottom-1 right-1">
                  <div className="flex items-center justify-center w-5 h-5 bg-green-500 text-white text-xs rounded-full">
                    {recordCount}
                  </div>
                </div>
              )}

              {/* 今日のマーカー */}
              {isToday && (
                <div className="absolute bottom-1 left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* ローディング表示 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-500">読み込み中...</span>
          </div>
        </div>
      )}
    </div>
  )
}