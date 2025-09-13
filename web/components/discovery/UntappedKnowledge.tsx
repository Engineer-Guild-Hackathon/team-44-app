import React from 'react';
import { MdStar, MdSearch } from 'react-icons/md';
import { UntappedKnowledgeItem } from '../../types/discovery';

interface UntappedKnowledgeProps {
  knowledge: UntappedKnowledgeItem | null;
  error?: string | null;
  onLoad?: () => void;
  onExplore: (category: string) => void;
}

export const UntappedKnowledge: React.FC<UntappedKnowledgeProps> = ({
  knowledge,
  error,
  onLoad,
  onExplore
}) => {
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--color-error)] mb-2">⭐</div>
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

  if (!knowledge) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--color-muted-foreground)] mb-4">⭐</div>
        <p className="text-[var(--color-muted-foreground)] text-sm mb-4">新しい発見はまだ準備中です</p>
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

  const handleExplore = () => {
    if (knowledge.googleSearchQuery) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(knowledge.googleSearchQuery)}`, '_blank');
    }
    onExplore(knowledge.category);
  };

  // nextAvailableがDateオブジェクトであることを確認
  const nextAvailableDate = knowledge.nextAvailable instanceof Date
    ? knowledge.nextAvailable
    : new Date(knowledge.nextAvailable);

  const daysUntilNext = Math.ceil((nextAvailableDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-gradient-to-br from-[var(--color-info)]/10 to-[var(--color-accent)]/10 rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
      <div className="flex items-center mb-4">
        <MdStar className="text-3xl mr-3 text-[var(--color-warning)]" />
        <h3 className="text-xl font-semibold text-[var(--color-text-light)]">
          新しい発見の提案
        </h3>
      </div>

      <div className="mb-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-info)]/20 text-[var(--color-info)] mb-3">
          {knowledge.category}
        </div>
        <p className="text-[var(--color-text-light)] mb-3">
          {knowledge.content}
        </p>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {knowledge.appeal}
        </p>
      </div>

      <button
        onClick={handleExplore}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-[var(--color-text-dark)] font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <MdSearch />
        {knowledge.category} を探索する
      </button>

      <div className="mt-4 text-xs text-[var(--color-muted-foreground)] text-center">
        次回提案まで: {daysUntilNext} 日
      </div>
    </div>
  );
};
