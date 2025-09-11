import './globals.css'
import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import InstallPrompt from '@/components/pwa/InstallPrompt'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp'
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Libraria - あなたの知識の図書館',
  description: 'AIを活用した学習支援アプリケーション。チャット、学習記録、カレンダー、リマインダー機能を備えています。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Libraria',
  },
  formatDetection: {
    telephone: false,
  },
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
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
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
    <html lang="ja" className={`${notoSansJP.variable} ${inter.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#C4A676" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body className="font-sans bg-[var(--color-bg-light)] text-[var(--color-text-light)] min-h-screen transition-colors duration-300">
        <ServiceWorkerRegistration />
        <InstallPrompt />
        {children}
      </body>
    </html>
  )
}
