import React from 'react';
import { MdMap, MdCalculate, MdScience, MdBiotech, MdHistory, MdPublic, MdMenuBook, MdLanguage, MdCode, MdPalette, MdMusicNote, MdPsychology, MdLightbulb } from 'react-icons/md';
import { InterestMapData } from '../../types/discovery';

interface BasicInterestMapProps {
  data: InterestMapData | null;
  error?: string | null;
  onLoad?: () => void;
  onNodeClick?: (category: string) => void;
}

export const BasicInterestMap: React.FC<BasicInterestMapProps> = ({ data, error, onLoad, onNodeClick }) => {
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--color-error)] mb-2">🗺️</div>
        <p className="text-[var(--color-error)] text-sm mb-4">{error}</p>
        {onLoad && (
          <button
            onClick={onLoad}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-[var(--color-text-dark)] text-sm py-2 px-4 rounded transition-colors duration-200"
          >
            再試行
          </button>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--color-muted-foreground)] mb-4">🗺️</div>
        <p className="text-[var(--color-muted-foreground)] text-sm mb-4">興味マップを読み込み中...</p>
        {onLoad && (
          <button
            onClick={onLoad}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-[var(--color-text-dark)] text-sm py-2 px-4 rounded transition-colors duration-200"
          >
            読み込む
          </button>
        )}
      </div>
    );
  }

  if (!data.hasData || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-8 border border-[var(--color-border)] text-center">
        <div className="text-6xl mb-4"> <MdMap /> </div>
        <h3 className="text-xl font-semibold text-[var(--color-text-light)] mb-3">
          興味マップ
        </h3>
        <p className="text-[var(--color-muted-foreground)] mb-6">
          {data.placeholderMessage || '学習データを集めて興味マップを作成しましょう'}
        </p>
        <div className="bg-[var(--color-muted)] rounded-lg p-6 border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            学習を続けると、あなたの興味分野が可視化され、新しい発見につながります
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
      <h3 className="text-xl font-semibold text-[var(--color-text-light)] mb-6 text-center">
        あなたの興味マップ
      </h3>

      {/* シンプルなノード表示 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {data.nodes.map((node) => (
          <div
            key={node.id}
            className="bg-gradient-to-br from-[var(--color-accent)] from-opacity-5 to-[var(--color-primary)] to-opacity-5 dark:from-[var(--color-accent)] dark:to-[var(--color-primary)] rounded-lg p-4 text-center hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer border border-[var(--color-border)]"
            onClick={() => onNodeClick?.(node.category)}
          >
            <div className="text-2xl mb-2 text-[var(--color-text-dark)]">
              {getCategoryIcon(node.category)}
            </div>
            <h4 className="font-medium text-[var(--color-text-dark)] mb-1">
              {node.category}
            </h4>
            <div className="text-sm text-[var(--color-text-dark)]">
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
      {data.suggestions && data.suggestions.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-6">
          <h4 className="text-lg font-medium text-[var(--color-text-light)] mb-4">
            次の興味分野の提案
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-[var(--color-dark)] bg-opacity-5 rounded-lg p-4 border border-[var(--color-dark)] border-opacity-20">
                <div className="flex items-center mb-2">
                  <MdLightbulb className="text-2xl mr-3 text-[var(--color-warning)]" />
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

// カテゴリに応じたアイコンを返す関数
function getCategoryIcon(category: string): JSX.Element {
  const iconMap: { [key: string]: JSX.Element } = {
    '数学': <MdCalculate />,
    '物理': <MdScience />,
    '化学': <MdScience />,
    '生物': <MdBiotech />,
    '歴史': <MdHistory />,
    '地理': <MdPublic />,
    '文学': <MdMenuBook />,
    '言語': <MdLanguage />,
    'プログラミング': <MdCode />,
    '芸術': <MdPalette />,
    '音楽': <MdMusicNote />,
    '哲学': <MdPsychology />,
  };

  return iconMap[category] || <MdMenuBook />;
}
