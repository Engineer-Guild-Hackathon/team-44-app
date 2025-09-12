import React from 'react';
import { KnowledgeItem } from '../../types/discovery';

interface KnowledgeDisplayProps {
  knowledge: KnowledgeItem;
  onDetailView?: () => void;
  onLike?: () => void;
}

export const KnowledgeDisplay: React.FC<KnowledgeDisplayProps> = ({ knowledge, onDetailView, onLike }) => {
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

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {knowledge.tags.map((tag, index) => (
            <span key={index} className="text-xs text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-1 rounded border border-[var(--color-border)]">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onLike}
            className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <span>❤️</span>
            いいね
          </button>

          {knowledge.googleSearchQuery && (
            <button
              onClick={handleSearchClick}
              className="text-[var(--color-info)] hover:text-[var(--color-info-hover)] text-sm font-medium underline transition-colors"
            >
              もっと詳しく調べる
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
