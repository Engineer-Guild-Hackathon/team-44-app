import React from 'react';
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
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-[var(--shadow-md)] p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center mb-4">
        <div className="text-3xl mr-3">🌟</div>
        <h3 className="text-xl font-semibold text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">
          新しい発見の提案
        </h3>
      </div>

      <div className="mb-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 mb-3">
          {untappedKnowledge.category}
        </div>
        <p className="text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] mb-3">
          {untappedKnowledge.content}
        </p>
        <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
          {untappedKnowledge.appeal}
        </p>
      </div>

      <button
        onClick={handleExplore}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <span>🔍</span>
        {untappedKnowledge.category} を探索する
      </button>

      <div className="mt-4 text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] text-center">
        次回提案まで: {Math.ceil((untappedKnowledge.nextAvailable.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 日
      </div>
    </div>
  );
};
