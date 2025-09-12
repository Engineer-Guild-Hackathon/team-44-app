import React from 'react';
import { InterestMapData } from '../../types/discovery';

interface BasicInterestMapProps {
  mapData: InterestMapData;
  hasData: boolean;
  onNodeClick?: (category: string) => void;
}

export const BasicInterestMap: React.FC<BasicInterestMapProps> = ({ mapData, hasData, onNodeClick }) => {
  if (!hasData || !mapData.nodes || mapData.nodes.length === 0) {
    return (
      <div className="bg-white dark:bg-[var(--color-bg-dark)] rounded-lg shadow-[var(--shadow-md)] p-8 border border-[var(--color-border)] text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-3">
          興味マップ
        </h3>
        <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-6">
          {mapData.placeholderMessage || '学習データを集めて興味マップを作成しましょう'}
        </p>
        <div className="bg-[var(--color-muted)] dark:bg-[var(--color-bg-dark)] rounded-lg p-6 border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
            学習を続けると、あなたの興味分野が可視化され、新しい発見につながります
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--color-bg-dark)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
      <h3 className="text-xl font-semibold text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-6 text-center">
        あなたの興味マップ
      </h3>

      {/* シンプルなノード表示 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {mapData.nodes.map((node) => (
          <div
            key={node.id}
            className="bg-gradient-to-br from-[var(--color-accent)] from-opacity-5 to-[var(--color-primary)] to-opacity-5 dark:from-[var(--color-accent)] dark:to-[var(--color-primary)] rounded-lg p-4 text-center hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer border border-[var(--color-border)]"
            onClick={() => onNodeClick?.(node.category)}
          >
            <div className="text-2xl mb-2">
              {getCategoryEmoji(node.category)}
            </div>
            <h4 className="font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-1">
              {node.category}
            </h4>
            <div className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              学習回数: {node.itemsViewed}
            </div>
            <div className="mt-2 bg-[var(--color-muted)] rounded-full h-2">
              <div
                className="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-500"
                style={{ width: `${node.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* 提案セクション */}
      {mapData.suggestions && mapData.suggestions.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-6">
          <h4 className="text-lg font-medium text-[var(--color-text-light)] mb-4">
            次の興味分野の提案
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapData.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-[var(--color-success)] bg-opacity-5 rounded-lg p-4 border border-[var(--color-success)] border-opacity-20">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">💡</span>
                  <h5 className="font-medium text-[var(--color-text-light)]">
                    {suggestion.category}
                  </h5>
                </div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
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
