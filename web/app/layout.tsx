import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import HamburgerMenu from '../components/common/HamburgerMenu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI学習サポート',
  description: 'AIとの対話を通じて、ユーザーが「自力で解けた」という達成感を得られる学習サポートアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
  {/* ナビゲーションバー */}
  <nav className="bg-white shadow-sm border-b fixed top-0 left-0 w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* ロゴ */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900 hidden sm:block">AI学習サポート</span>
                  <span className="text-lg font-bold text-gray-900 sm:hidden">AI学習</span>
                </Link>
              </div>

              {/* ハンバーガーメニュー */}
              <HamburgerMenu />
            </div>
          </div>
        </nav>

        <div className="min-h-screen bg-background pt-16">
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
