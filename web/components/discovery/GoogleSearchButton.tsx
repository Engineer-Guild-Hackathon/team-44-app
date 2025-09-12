import React from 'react';

interface GoogleSearchButtonProps {
  searchQuery: string;
  label?: string;
  className?: string;
}

export const GoogleSearchButton: React.FC<GoogleSearchButtonProps> = ({
  searchQuery,
  label = 'もっと詳しく調べる',
  className = ''
}) => {
  const handleClick = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={`text-blue-600 hover:text-blue-800 text-sm font-medium underline transition-colors ${className}`}
    >
      {label}
    </button>
  );
};
