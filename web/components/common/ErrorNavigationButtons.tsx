import React from 'react';
import { useRouter } from 'next/navigation';

interface ErrorNavigationButtonsProps {
  showRetry?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  homeLabel?: string;
  loginLabel?: string;
  className?: string;
}

export const ErrorNavigationButtons: React.FC<ErrorNavigationButtonsProps> = ({
  showRetry = false,
  onRetry,
  retryLabel = '再試行',
  homeLabel = 'ホームに戻る',
  loginLabel = 'ログイン画面へ',
  className = ''
}) => {
  const router = useRouter();

  return (
    <div className={`space-y-4 ${className}`}>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="w-full bg-[var(--color-primary)] text-[var(--color-text-dark)] px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
        >
          {retryLabel}
        </button>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/chat')}
          className="flex-1 bg-[var(--color-bg-light)] border border-[var(--color-border)] text-[var(--color-text-light)] px-4 py-2 rounded hover:bg-[var(--color-accent)] hover:bg-opacity-10 transition-colors font-medium"
        >
          {homeLabel}
        </button>

        <button
          onClick={() => router.push('/auth')}
          className="flex-1 bg-[var(--color-bg-light)] border border-[var(--color-border)] text-[var(--color-text-light)] px-4 py-2 rounded hover:bg-[var(--color-accent)] hover:bg-opacity-10 transition-colors font-medium"
        >
          {loginLabel}
        </button>
      </div>
    </div>
  );
};

export default ErrorNavigationButtons;
