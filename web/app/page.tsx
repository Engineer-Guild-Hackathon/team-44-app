'use client'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI学習サポート
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AIとの対話を通じて、あなたが「自力で解けた」という達成感を得られる学習サポートアプリです。
          わからない問題をAIと一緒に解決しましょう。
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-500 text-3xl mb-4">💡</div>
            <h3 className="text-lg font-semibold mb-2">ヒント提供</h3>
            <p className="text-gray-600">答えを直接教えるのではなく、段階的なヒントでサポート</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-500 text-3xl mb-4">🧩</div>
            <h3 className="text-lg font-semibold mb-2">問題分解</h3>
            <p className="text-gray-600">複雑な問題を小さな問題に分けて理解しやすく</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-500 text-3xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">対話学習</h3>
            <p className="text-gray-600">インタラクティブな対話で理解度を確認しながら学習</p>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href="/chat"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            学習を始める
          </a>

          <div className="text-sm text-gray-500">
            <p>サービスを利用するにはログインが必要です</p>
          </div>
        </div>
      </div>
    </div>
  )
}
