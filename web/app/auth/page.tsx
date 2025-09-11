'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Header from '../../components/common/Header'
import Navigation from '../../components/common/Navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { user, loading, error, signIn, signUp, logout, clearError } = useAuth()
  const [localError, setLocalError] = useState('')
  const [isNavOpen, setIsNavOpen] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/chat'
    }
  }, [user, loading])

  useEffect(() => {
    setLocalError(error || '')
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()
    if (!email || !password) {
      setLocalError('メールアドレスとパスワードを入力してください')
      return
    }
    if (isLogin) {
      await signIn(email, password)
    } else {
      await signUp(email, password)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex">
      <Header onMenuClick={() => setIsNavOpen(true)} isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />
      <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <div className="flex-1 flex flex-col">
        <div className={`pt-16 pb-20 md:pb-6 px-4 py-8 flex items-center justify-center min-h-screen ${isNavOpen ? '' : 'md:max-w-md md:mx-auto'}`}>
          <div className="w-full max-w-md">
            {/* Libraria Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--color-text-dark)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--color-text-light)] mb-2">
                Libraria
              </h1>
              <p className="text-[var(--color-muted-foreground)]">
                あなたの知識の図書館
              </p>
            </div>

            {/* Auth Form */}
            <div className="bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-light)] mb-2">
                  {isLogin ? 'ログイン' : 'アカウント作成'}
                </h2>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {isLogin
                    ? '登録済みの方はこちらからログインしてください'
                    : 'はじめての方はアカウントを作成してください'}
                </p>
              </div>

              {/* Error Message */}
              {localError && (
                <div className="mb-6 p-4 bg-[var(--color-error)] bg-opacity-10 border border-[var(--color-error)] border-opacity-20 rounded-lg">
                  <p className="text-sm text-[var(--color-error)]">{localError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field w-full"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    パスワード
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field w-full"
                    placeholder="パスワード"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成')}
                </button>
              </form>

              {/* Toggle Link */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[var(--color-accent)] hover:text-[var(--color-primary)] text-sm transition-colors"
                >
                  {isLogin
                    ? 'アカウントをお持ちでない方はこちら'
                    : '既にアカウントをお持ちの方はこちら'
                  }
                </button>
              </div>

              {/* Logout for logged-in users */}
              {!loading && user && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={logout}
                    className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:opacity-80 text-sm transition-colors"
                  >
                    ログアウトして別アカウントでログイン
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-xs text-[var(--color-muted-foreground)]">
                © 2025 Libraria - あなたの知識の図書館
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
