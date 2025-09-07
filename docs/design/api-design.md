# API設計書

## 1. 概要

AI学習サポート機能のRESTful API設計書です。

## 2. ベースURL

- **本番環境**: `https://us-central1-ai-learning-support-project.cloudfunctions.net/api`
- **開発環境**: `http://127.0.0.1:5001/ai-learning-support-project/us-central1/api`

## 3. 認証

全てのAPIエンドポイント（`/health`を除く）では、Firebase AuthenticationのIDトークンが必要です。

```
Authorization: Bearer <firebase_id_token>
```

## 4. APIエンドポイント

### 4.1 ヘルスチェック

#### GET /health

**概要**: サーバーの稼働状況を確認

**認証**: 不要

**レスポンス**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4.2 チャットセッション管理

#### POST /chatSessions

**概要**: 新しいチャットセッションを作成

**認証**: 必要

**リクエストボディ**:
```json
{
  "title": "数学の問題について"  // オプション
}
```

**レスポンス**:
```json
{
  "sessionId": "session123",
  "message": "チャットセッションが作成されました"
}
```

**エラーレスポンス**:
```json
{
  "error": "認証トークンが必要です"
}
```

#### GET /chatSessions

**概要**: ユーザーのチャットセッション一覧を取得

**認証**: 必要

**レスポンス**:
```json
{
  "sessions": [
    {
      "id": "session123",
      "userId": "user123",
      "title": "数学の問題について",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:30:00.000Z",
      "messages": [
        {
          "role": "user",
          "parts": [{"text": "こんにちは"}],
          "timestamp": "2024-01-01T12:00:00.000Z"
        }
      ]
    }
  ],
  "message": "セッション一覧を取得しました"
}
```

#### GET /chatSessions/:sessionId

**概要**: 特定のチャットセッションを取得

**認証**: 必要

**パラメータ**:
- `sessionId` (string): セッションID

**レスポンス**:
```json
{
  "session": {
    "id": "session123",
    "userId": "user123",
    "title": "数学の問題について",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:30:00.000Z",
    "messages": [...]
  },
  "message": "セッションを取得しました"
}
```

### 4.3 メッセージ管理

#### POST /chatSessions/:sessionId/messages

**概要**: チャットセッションにメッセージを送信

**認証**: 必要

**パラメータ**:
- `sessionId` (string): セッションID

**リクエストボディ**:
```json
{
  "message": "この数学の問題がわかりません"
}
```

**レスポンス**:
```json
{
  "response": "どのような問題でしょうか？まず問題文を教えてください。",
  "sessionId": "session123",
  "message": "メッセージが送信されました"
}
```

## 5. データモデル

### 5.1 ChatSession

```typescript
interface ChatSession {
  id: string;                // セッションID
  userId: string;            // ユーザーID
  title?: string;            // セッションタイトル
  createdAt: Date;           // 作成日時
  updatedAt: Date;           // 更新日時
  messages: ChatMessage[];   // メッセージ配列
}
```

### 5.2 ChatMessage

```typescript
interface ChatMessage {
  role: 'user' | 'model';    // メッセージの送信者
  parts: { text: string }[]; // メッセージ内容（配列形式）
  timestamp?: Date;          // 送信日時
}
```

## 6. エラーハンドリング

### 6.1 HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | 不正なリクエスト |
| 401 | 認証エラー |
| 403 | 認可エラー |
| 404 | リソースが見つからない |
| 500 | サーバーエラー |

### 6.2 エラーレスポンス形式

```json
{
  "error": "エラーメッセージ"
}
```

### 6.3 主なエラーケース

1. **認証エラー**
   - ステータス: 401
   - メッセージ: "認証トークンが必要です"

2. **セッション不存在**
   - ステータス: 404
   - メッセージ: "セッションが見つかりません"

3. **権限エラー**
   - ステータス: 403
   - メッセージ: "このセッションにアクセスする権限がありません"

4. **LLM APIエラー**
   - ステータス: 500
   - メッセージ: "AI応答の生成に失敗しました"

## 7. レート制限

### 7.1 制限値

- **メッセージ送信**: 1ユーザーあたり60回/分
- **セッション作成**: 1ユーザーあたり10回/分

### 7.2 制限超過時の応答

```json
{
  "error": "レート制限を超過しました。しばらく待ってから再試行してください。"
}
```

## 8. WebHook（将来対応）

### 8.1 学習記録通知

- **URL**: POST /webhooks/learning-record
- **用途**: フェーズ4連携での学習記録自動登録

## 9. バージョニング

現在のAPIバージョン: v1

将来的にはURL Pathでのバージョニングを採用予定:
- `/v1/chatSessions`
- `/v2/chatSessions`

## 10. 開発・テスト用エンドポイント

### 10.1 Firebase Emulator

開発環境では、Firebase Emulatorsを使用:
- Functions: `http://localhost:5001`
- Firestore: `http://localhost:8080`
- Auth: `http://localhost:9099`
