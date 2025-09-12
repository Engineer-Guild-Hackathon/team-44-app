import React from 'react';
import { InterestMapData } from '../../types/discovery';

interface BasicInterestMapProps {
  mapData: InterestMapData;
  hasData: boolean;
}

export const BasicInterestMap: React.FC<BasicInterestMapProps> = ({ mapData, hasData }) => {
  if (!hasData || !mapData.nodes || mapData.nodes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            興味マップ
          </h3>
          <p className="text-gray-600 mb-4">
            {mapData.placeholderMessage || '学習データを集めて興味マップを作成しましょう'}
          </p>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              学習を続けると、あなたの興味分野が可視化され、新しい発見につながります
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        あなたの興味マップ
      </h3>

      {/* シンプルなノード表示 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {mapData.nodes.map((node) => (
          <div
            key={node.id}
            className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="text-2xl mb-2">
              {getCategoryEmoji(node.category)}
            </div>
            <h4 className="font-medium text-gray-800 mb-1">
              {node.category}
            </h4>
            <div className="text-sm text-gray-600">
              学習回数: {node.itemsViewed}
            </div>
            <div className="mt-2 bg-blue-300 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${node.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* 提案セクション */}
      {mapData.suggestions && mapData.suggestions.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            次の興味分野の提案
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapData.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">💡</span>
                  <h5 className="font-medium text-gray-800">
                    {suggestion.category}
                  </h5>
                </div>
                <p className="text-sm text-gray-600">
                  {suggestion.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// カテゴリに応じた絵文字を返す関数
function getCategoryEmoji(category: string): string {
  const emojiMap: { [key: string]: string } = {
    '数学': '🔢',
    '物理': '⚛️',
    '化学': '🧪',
    '生物': '🧬',
    '歴史': '📜',
    '地理': '🌍',
    '文学': '📚',
    '言語': '🗣️',
    'プログラミング': '💻',
    '芸術': '🎨',
    '音楽': '🎵',
    '哲学': '🤔',
  };

  return emojiMap[category] || '📖';
}
