import React from 'react';
import { MdFavorite, MdSearch, MdMenuBook } from 'react-icons/md';
import { KnowledgeItem } from '../../types/discovery';

interface KnowledgeDisplayProps {
  knowledge: KnowledgeItem | null;
  error?: string | null;
  onLoad?: () => void;
  onDetailView?: () => void;
  onLike?: () => void;
}

export const KnowledgeDisplay: React.FC<KnowledgeDisplayProps> = ({ knowledge, error, onLoad, onDetailView, onLike }) => {
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--color-error)] mb-2">⚠️</div>
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
        <MdMenuBook className="text-[var(--color-muted-foreground)] text-2xl mb-4 mx-auto" />
        <p className="text-[var(--color-muted-foreground)] text-sm mb-4">今日の豆知識はまだ準備中です</p>
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
  const handleSearchClick = () => {
    if (knowledge.googleSearchQuery) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(knowledge.googleSearchQuery)}`;
      window.open(searchUrl, '_blank');
      onDetailView?.();
    }
  };

  return (
    <div className="bg-[var(--color-bg-light)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
      <div className="mb-4">
        <span className="inline-block bg-[var(--color-info)] bg-opacity-10 text-[var(--color-text-dark)] text-xs px-3 py-1 rounded-full mb-3 font-medium">
          {knowledge.category}
        </span>
        <p className="text-[var(--color-text-light)] text-lg leading-relaxed">
          {knowledge.content}
        </p>
      </div>

      {knowledge.mermaidDiagram && (
        <div className="mb-4 p-4 bg-[var(--color-muted)] rounded border border-[var(--color-border)]">
          <pre className="text-sm text-[var(--color-text-light)] whitespace-pre-wrap">
            {knowledge.mermaidDiagram}
          </pre>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {knowledge.tags.map((tag, index) => (
          <span key={index} className="text-xs text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-1 rounded border border-[var(--color-border)]">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex justify-end items-center">

        <div className="flex gap-4">
          <button
            onClick={onLike}
            className="text-[var(--color-error)] hover:text-[var(--color-warning)] text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <MdFavorite />
            いいね
          </button>

          {knowledge.googleSearchQuery && (
            <button
              onClick={handleSearchClick}
              className="text-[var(--color-info)] hover:text-[var(--color-info-hover)] text-sm font-medium underline transition-colors flex items-center gap-1"
            >
              <MdSearch />
              もっと詳しく調べる
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
