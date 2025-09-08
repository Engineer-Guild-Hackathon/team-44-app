# 最終設計ドキュメント

## 1. システム概要
v1.md Design-Docsに基づく学習継続支援機能の完全実装

## 2. アーキテクチャ設計

### 2.1 技術スタック
- **フロントエンド**: Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **バックエンド**: Firebase Functions, Node.js 20+, TypeScript, Express
- **データベース**: Firebase Firestore
- **認証**: Firebase Authentication
- **通知**: PWA Push API + Firebase Cloud Messaging
- **状態管理**: Zustand

### 2.2 システム構成図
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Next.js Web    │    │ Firebase         │    │ External APIs   │
│  Application    │◄──►│ Functions        │◄──►│ (Gemini/OpenAI) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│ PWA Push        │    │ Firebase         │
│ Notifications   │    │ Firestore        │
└─────────────────┘    └──────────────────┘
```

## 3. データベース設計

### 3.1 新規コレクション
1. **learningRecords**: AI生成学習記録
2. **reminders**: リマインダー管理
3. **reminderSettings**: ユーザー設定

### 3.2 データモデル
```typescript
interface LearningRecord {
  id: string
  userId: string
  sessionId: string
  subject: string
  topic: string
  summary: string
  duration: number
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

interface Reminder {
  id: string
  userId: string
  learningRecordId: string
  scheduledAt: Date
  completed: boolean
  notificationSent: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface ReminderSettings {
  id: string
  userId: string
  enabled: boolean
  notificationMethods: ('push' | 'email')[]
  reminderIntervals: number[]
  quietHours: { start: string; end: string }
  timezone: string
  createdAt: Date
  updatedAt: Date
}
```

## 4. API設計

### 4.1 新規エンドポイント
- `POST /learningRecords/generate` - 学習記録生成
- `GET /learningRecords` - 学習記録一覧取得
- `GET /reminderSettings` - リマインダー設定取得
- `PUT /reminderSettings` - リマインダー設定更新
- `POST /reminders/schedule` - リマインダー設定
- `GET /reminders/pending` - 未完了リマインダー取得
- `PUT /reminders/:id/complete` - リマインダー完了

### 4.2 認証
全エンドポイントでFirebase ID Tokenによる認証が必要

## 5. UI/UX設計

### 5.1 新規ページ
- `/reminders` - リマインダー設定画面
- `/calendar` - 学習カレンダー画面

### 5.2 新規コンポーネント
- `ReminderSettings` - リマインダー設定フォーム
- `NotificationPrompt` - PWA通知許可プロンプト

## 6. 機能仕様

### 6.1 学習記録自動生成
- チャットセッション終了時にAIが学習内容を要約
- 教科、トピック、要約、学習時間を自動抽出
- Firestoreに永続化

### 6.2 リマインダーシステム
- エビングハウス忘却曲線に基づくスケジュール [1,3,7,14,30日]
- PWAプッシュ通知での配信
- ユーザーカスタマイズ可能な設定

### 6.3 学習カレンダー
- 月次カレンダービューで学習記録を視覚化
- 教科別色分け表示
- 学習統計情報の表示
