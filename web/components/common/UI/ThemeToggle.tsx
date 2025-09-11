'use client'

import { useTheme } from '../../../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-md bg-[var(--color-muted)] flex items-center justify-center">
        <div className="w-4 h-4 bg-[var(--color-muted-foreground)] rounded-sm"></div>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-md bg-[var(--color-muted)] hover:bg-[var(--color-accent)] hover:bg-opacity-10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      aria-label={`テーマを${theme === 'light' ? 'ダーク' : 'ライト'}に切り替え`}
    >
      {theme === 'light' ? (
        // 月アイコン (ダークモード)
        <svg
          className="w-5 h-5 text-[var(--color-text-light)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // 太陽アイコン (ライトモード)
        <svg
          className="w-5 h-5 text-[var(--color-text-light)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  )
}
