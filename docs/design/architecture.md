# AI学習サポート機能 アーキテクチャ設計書

## 1. 概要

本文書は、AI学習サポート機能のMVPにおけるシステムアーキテクチャを定義します。

### 1.1 システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド  │    │   バックエンド    │    │   外部サービス   │
│   (Next.js)     │◄──►│ (Firebase Funcs) │◄──►│  (Gemini/OpenAI) │
│   - Vercel      │    │   - Firebase     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │   データベース   │
                       │   (Firestore)   │
                       └─────────────────┘
```

### 1.2 技術スタック

| レイヤー | 技術 | 詳細 |
|---------|------|------|
| フロントエンド | Next.js 14 + React 18 + TypeScript | SSG対応、App Router使用 |
| UIライブラリ | Tailwind CSS + Shadcn/ui | レスポンシブデザイン |
| 状態管理 | Zustand | 軽量な状態管理 |
| バックエンド | Node.js + Express + TypeScript | Firebase Functions |
| データベース | Firestore | NoSQLドキュメントDB |
| 認証 | Firebase Authentication | メール/パスワード認証 |
| LLM API | Google Gemini API / OpenAI API | 抽象化レイヤーで切替可能 |
| インフラ | Vercel + Firebase | サーバーレス構成 |

## 2. アーキテクチャパターン

### 2.1 レイヤード アーキテクチャ

```
┌─────────────────────────────────┐
│         Presentation Layer       │  ← Next.js App Router
├─────────────────────────────────┤
│         Application Layer        │  ← React Components + Hooks
├─────────────────────────────────┤
│         Domain Layer            │  ← Business Logic (Store)
├─────────────────────────────────┤
│         Infrastructure Layer     │  ← API Client + Firebase
└─────────────────────────────────┘
```

### 2.2 バックエンド サービス構成

```
┌─────────────────────────────────┐
│         API Gateway              │  ← Express Router
├─────────────────────────────────┤
│         Controller Layer         │  ← Request/Response処理
├─────────────────────────────────┤
│         Service Layer           │  ← ビジネスロジック
├─────────────────────────────────┤
│         Repository Layer        │  ← データアクセス (Firestore)
├─────────────────────────────────┤
│         External API Layer      │  ← LLM Provider (抽象化)
└─────────────────────────────────┘
```

## 3. データフロー

### 3.1 チャットメッセージ送信フロー

```
[User Input]
    ↓
[Frontend State] → [API Client] → [Firebase Functions]
    ↓                                      ↓
[UI Update] ← [Response] ← [LLM API] ← [Chat Service]
    ↓                                      ↓
[Message Display]                  [Firestore Save]
```

### 3.2 認証フロー

```
[Login Form] → [Firebase Auth] → [ID Token] → [Backend Verification]
     ↓              ↓                ↓               ↓
[User State] ← [Auth State] ← [Token Refresh] ← [Session Management]
```

## 4. セキュリティ考慮事項

### 4.1 認証・認可
- Firebase Authentication による安全なID管理
- JWTトークンによるAPIアクセス制御
- ユーザーごとのデータ分離

### 4.2 データ保護
- HTTPS通信の強制
- 環境変数による機密情報管理
- Firestoreセキュリティルールによるアクセス制御

### 4.3 API制限
- レート制限による不正利用防止
- 入力値検証
- SQLインジェクション対策（NoSQLだが同等の対策）

## 5. スケーラビリティ考慮事項

### 5.1 水平スケーリング
- Firebase Functionsの自動スケーリング
- Firestoreの自動分散
- Vercelのエッジ配信

### 5.2 パフォーマンス最適化
- Next.jsのSSG活用
- 画像最適化
- CDNキャッシュ戦略

## 6. 監視・ログ

### 6.1 監視項目
- API応答時間
- エラー率
- ユーザーアクセス数
- LLM API使用量

### 6.2 ログ収集
- Firebase Functions ログ
- Vercel アクセスログ
- エラートラッキング

## 7. 今後の拡張性

### 7.1 機能拡張
- 写真入力対応
- 音声入力対応
- リアルタイム協調学習

### 7.2 技術拡張
- マイクロサービス化
- GraphQL導入
- WebSocket対応

## 8. 制約事項

### 8.1 技術制約
- Firebase Functionsの実行時間制限（540秒）
- Firestoreのクエリ制限
- LLM APIのレート制限

### 8.2 ビジネス制約
- 無料プランの利用制限
- データ保持期間の制限
- 対応言語の制限（日本語のみ）
