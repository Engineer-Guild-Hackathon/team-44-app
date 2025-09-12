import React from 'react';
import { MdStar, MdSearch } from 'react-icons/md';
import { UntappedKnowledgeItem } from '../../types/discovery';

interface UntappedKnowledgeProps {
  untappedKnowledge: UntappedKnowledgeItem;
  onExplore: (category: string) => void;
}

export const UntappedKnowledge: React.FC<UntappedKnowledgeProps> = ({
  untappedKnowledge,
  onExplore
}) => {
  const handleExplore = () => {
    if (untappedKnowledge.googleSearchQuery) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(untappedKnowledge.googleSearchQuery)}`, '_blank');
    }
    onExplore(untappedKnowledge.category);
  };

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
          {untappedKnowledge.category}
        </div>
        <p className="text-[var(--color-text-light)] mb-3">
          {untappedKnowledge.content}
        </p>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {untappedKnowledge.appeal}
        </p>
      </div>

      <button
        onClick={handleExplore}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-[var(--color-text-dark)] font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <MdSearch />
        {untappedKnowledge.category} を探索する
      </button>

      <div className="mt-4 text-xs text-[var(--color-muted-foreground)] text-center">
        次回提案まで: {Math.ceil((untappedKnowledge.nextAvailable.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 日
      </div>
    </div>
  );
};
