import React from 'react';
import { KnowledgeItem } from '../../types/discovery';

interface KnowledgeDisplayProps {
  knowledge: KnowledgeItem;
  onDetailView?: () => void;
}

export const KnowledgeDisplay: React.FC<KnowledgeDisplayProps> = ({ knowledge, onDetailView }) => {
  const handleSearchClick = () => {
    if (knowledge.googleSearchQuery) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(knowledge.googleSearchQuery)}`;
      window.open(searchUrl, '_blank');
      onDetailView?.();
    }
  };

  return (
    <div className="bg-white dark:bg-[var(--color-bg-dark)] rounded-lg shadow-[var(--shadow-md)] p-6 border border-[var(--color-border)]">
      <div className="mb-4">
        <span className="inline-block bg-[var(--color-accent)] bg-opacity-10 text-[var(--color-primary)] text-xs px-3 py-1 rounded-full mb-3 font-medium">
          {knowledge.category}
        </span>
        <p className="text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] text-lg leading-relaxed">
          {knowledge.content}
        </p>
      </div>

      {knowledge.mermaidDiagram && (
        <div className="mb-4 p-4 bg-[var(--color-muted)] dark:bg-[var(--color-bg-dark)] rounded border border-[var(--color-border)]">
          <pre className="text-sm text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] whitespace-pre-wrap">
            {knowledge.mermaidDiagram}
          </pre>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {knowledge.tags.map((tag, index) => (
            <span key={index} className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] bg-[var(--color-muted)] dark:bg-[var(--color-bg-dark)] px-2 py-1 rounded border border-[var(--color-border)]">
              #{tag}
            </span>
          ))}
        </div>

        {knowledge.googleSearchQuery && (
          <button
            onClick={handleSearchClick}
            className="text-[var(--color-accent)] hover:text-[var(--color-primary)] text-sm font-medium underline transition-colors"
          >
            もっと詳しく調べる
          </button>
        )}
      </div>
    </div>
  );
};
