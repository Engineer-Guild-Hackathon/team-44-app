## チーム情報
- チーム番号: 44
- チーム名: オランダ
- プロダクト名: tothlus
- メンバー: soranjiro, Sora4431, Won-CCS

---

## デモ / プレゼン資料
- デモURL: https://tothlus.vercel.app/chat/
- プレゼンURL: https://docs.google.com/presentation/d/1tuaVaOBQiEgH6zRTTIhsU3APmeiQyEirYKwaF8_ImOg/edit?usp=sharing


---


# tothlus (Team 44 - オランダ)

AIとの対話を通じて学習を継続的にサポートするアプリケーション

## プロダクト概要

学習者が「自力で解けた」という達成感を得ながら、忘却曲線に基づいた自動リマインドで学習継続をサポートするAI学習アプリケーションです。

### 主要機能 (v1)

- 🤖 **AI対話による学習サポート**: 答えを直接教えるのではなく、ヒントや質問で導く
- 📝 **自動学習記録生成**: チャット内容をAIが分析し、学習記録を自動作成
- 📅 **学習カレンダー**: 学習履歴を視覚的に確認
- 🔔 **忘却曲線リマインド**: エビングハウスの忘却曲線に基づく復習通知
- 📱 **PWA対応**: モバイル端末でのアプリライクな体験

### 技術スタック

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Firebase Functions + Express
- **Database**: Cloud Firestore
- **AI**: Gemini API / OpenAI API
- **State Management**: Zustand
- **Deployment**: Vercel (Frontend) + Firebase (Backend)

## クイックスタート

### 必要な環境
- Node.js 20+
- npm 10+

### セットアップ
```bash
# 依存関係のインストール
npm install
cd web && npm install
cd ../functions && npm install

# 環境変数の設定
cp functions/.env.example functions/.env
cp web/.env.example web/.env.local
# 環境変数を適切に設定してください

# ビルド
npm run build

# 開発サーバー起動
npm run dev
```

### デプロイ
```bash
# Frontend (Vercel)
cd web && npm run build

# Backend (Firebase Functions)
cd functions && npm run deploy
```

## プロジェクト構成

```
/
├── functions/          # バックエンド (Firebase Functions)
│   ├── src/
│   │   ├── controllers/    # API エンドポイント
│   │   ├── services/       # ビジネスロジック
│   │   ├── models/         # データ型定義
│   │   └── llm/           # LLM統合
├── web/               # フロントエンド (Next.js)
│   ├── app/               # App Router
│   ├── components/        # UIコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── lib/              # ユーティリティ
│   └── store/            # 状態管理
├── docs/              # 設計ドキュメント
└── firebase.json      # Firebase設定
```

## 詳細な開発ガイド

詳しい開発方法については [DEVELOPMENT.md](./DEVELOPMENT.md) をご覧ください。
