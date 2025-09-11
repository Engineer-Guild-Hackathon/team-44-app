'use client'

import { LearningRecord } from '../../types/api'

interface LearningRecordListProps {
  date: Date
  records: LearningRecord[]
  onRecordSelect: (recordId: string) => void
}

export function LearningRecordList({ date, records, onRecordSelect }: LearningRecordListProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric'
    })
  }

  const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: string } = {
      '数学': '📐',
      '英語': '🔤',
      '物理': '⚛️',
      '化学': '🧪',
      '生物': '🧬',
      '国語': '📚',
      '社会': '🌍',
      '歴史': '📜',
      'プログラミング': '💻',
      'その他': '📖'
    }
    return icons[subject] || icons['その他']
  }

  const getDifficultyColor = (difficulty: number) => {
    const colors: { [key: number]: string } = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    }
    return colors[difficulty] || colors[3]
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'paused': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || colors['active']
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'active': '進行中',
      'completed': '完了',
      'paused': '一時停止'
    }
    return labels[status] || '進行中'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {formatDate(date)}の学習記録
      </h3>

      {records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p>この日は学習記録がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <div
              key={record.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
              onClick={() => onRecordSelect(record.id)}
            >
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSubjectIcon(record.subject)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {record.subject} - {record.topic}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(record.difficulty)}`}>
                        レベル{record.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                <div>
                  <span className="font-medium">累計時間:</span> {record.totalDuration}分
                </div>
                <div>
                  <span className="font-medium">セッション数:</span> {record.sessionCount}回
                </div>
              </div>

              {/* サマリー */}
              {record.summary && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {record.summary}
                </p>
              )}

              {/* キーポイント */}
              {record.keyPoints && record.keyPoints.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">学習ポイント:</div>
                  <div className="flex flex-wrap gap-1">
                    {record.keyPoints.slice(0, 3).map((point, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {point}
                      </span>
                    ))}
                    {record.keyPoints.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                        +{record.keyPoints.length - 3}個
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* アクションエリア */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  最終学習: {new Date(record.lastStudiedAt).toLocaleDateString('ja-JP')}
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRecordSelect(record.id)
                    }}
                  >
                    詳細を見る
                  </button>
                  <button 
                    className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: 新しいセッション開始機能
                    }}
                  >
                    続きから学習
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}