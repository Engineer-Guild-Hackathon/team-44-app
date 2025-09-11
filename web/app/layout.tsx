import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Libraria - あなたの知識の図書館',
  description: 'AIを活用した学習支援アプリケーション。チャット、学習記録、カレンダー、リマインダー機能を備えています。',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Libraria',
    title: 'Libraria - あなたの知識の図書館',
    description: 'AIを活用した学習支援アプリケーション',
  },
  twitter: {
    card: 'summary',
    title: 'Libraria - あなたの知識の図書館',
    description: 'AIを活用した学習支援アプリケーション',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C4A676',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Libraria" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#C4A676" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="font-sans bg-[var(--color-bg-light)] text-[var(--color-text-light)] min-h-screen transition-colors duration-300">
        {children}
      </body>
    </html>
  )
}
