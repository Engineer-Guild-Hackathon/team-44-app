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
        <MdStar className="text-[var(--color-error)] text-2xl mb-2 mx-auto" />
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
    // デフォルトの未開拓知識データを表示
    const defaultKnowledge = {
      category: '哲学',
      content: '「なぜ生きるのか？」という根本的な問いから始まる哲学は、日常生活のあらゆる側面に影響を与えます。',
      appeal: '論理的思考力を養い、人生の意味について深く考えるきっかけになります。',
      googleSearchQuery: '哲学 入門 なぜ生きるのか',
      nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後
    };

    const handleExplore = () => {
      if (defaultKnowledge.googleSearchQuery) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(defaultKnowledge.googleSearchQuery)}`, '_blank');
      }
      onExplore(defaultKnowledge.category);
    };

    const daysUntilNext = Math.ceil((defaultKnowledge.nextAvailable.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

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
            {defaultKnowledge.category}
          </div>
          <p className="text-[var(--color-text-light)] mb-3">
            {defaultKnowledge.content}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {defaultKnowledge.appeal}
          </p>
        </div>

        <button
          onClick={handleExplore}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-[var(--color-text-dark)] font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <MdSearch />
          {defaultKnowledge.category} を探索する
        </button>

        <div className="mt-4 text-xs text-[var(--color-muted-foreground)] text-center">
          次回提案まで: {daysUntilNext} 日
        </div>
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
