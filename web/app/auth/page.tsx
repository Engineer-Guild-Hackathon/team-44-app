'use client'


import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { user, loading, error, signIn, signUp, logout, clearError } = useAuth()
  const [localError, setLocalError] = useState('')

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'ログイン' : 'アカウント作成'}
            </h1>
            <p className={`mb-4 ${isLogin ? 'text-gray-600' : 'text-green-700 font-semibold'}`}>
              {isLogin
                ? '登録済みの方はこちらからログインしてください'
                : 'はじめての方はアカウントを作成してください'}
            </p>
          </div>

          {/* エラーメッセージ */}
          {localError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {localError}
            </div>
          )}

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パスワード"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                ${isLogin
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'}
              `}
            >
              {loading ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成')}
            </button>
          </form>

          {/* 切り替えリンク */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLogin
                ? 'アカウントをお持ちでない方はこちら'
                : '既にアカウントをお持ちの方はこちら'
              }
            </button>
          </div>

          {/* 既にログイン済みの場合のログアウトボタン */}
          {!loading && user && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={logout}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                ログアウトして別アカウントでログイン
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
