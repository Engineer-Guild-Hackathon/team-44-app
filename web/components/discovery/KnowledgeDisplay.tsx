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
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
          {knowledge.category}
        </span>
        <p className="text-gray-800 text-lg leading-relaxed">
          {knowledge.content}
        </p>
      </div>

      {knowledge.mermaidDiagram && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <pre className="text-sm text-gray-600 whitespace-pre-wrap">
            {knowledge.mermaidDiagram}
          </pre>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {knowledge.tags.map((tag, index) => (
            <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>

        {knowledge.googleSearchQuery && (
          <button
            onClick={handleSearchClick}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            もっと詳しく調べる
          </button>
        )}
      </div>
    </div>
  );
};
