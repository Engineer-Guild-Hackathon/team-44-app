# データベース設計書

## 1. 概要

AI学習サポート機能で使用するFirestoreデータベースの設計書です。

## 2### 3.3 learningRecords コレクション

**パス**: `/learningRecords/{recordId}`

```javascript
{
  // ドキュメントID: 自動生成
  "userId": "string",           // ユーザーID (必須)
  "sessionId": "string",        // 関連セッションID (必須)
  "subject": "string",          // 教科 (例: "math", "science") (必須)
  "topic": "string",            // トピック (必須)
  "summary": "string",          // AI生成要約 (必須)
  "duration": "number",         // 学習時間（分） (必須)
  "completedAt": "timestamp",   // 完了日時 (必須)
  "createdAt": "timestamp",     // 作成日時 (必須)
  "updatedAt": "timestamp"      // 更新日時 (必須)
}
```

### 3.4 reminders コレクション

**パス**: `/reminders/{reminderId}`

```javascript
{
  // ドキュメントID: 自動生成
  "userId": "string",           // ユーザーID (必須)
  "recordId": "string",         // 関連学習記録ID (必須)
  "scheduledAt": "timestamp",   // スケジュール日時 (必須)
  "status": "string",           // ステータス ("pending", "sent", "completed") (必須)
  "type": "string",             // タイプ ("review", "practice") (必須)
  "createdAt": "timestamp",     // 作成日時 (必須)
  "updatedAt": "timestamp"      // 更新日時 (必須)
}
```

### 3.5 reminderSettings コレクション

**パス**: `/reminderSettings/{userId}`

```javascript
{
  // ドキュメントID: ユーザーID
  "enabled": "boolean",         // リマインド有効/無効 (必須)
  "notificationMethods": ["string"], // 通知方法 ["push", "email"] (必須)
  "reviewIntervals": ["number"], // カスタム間隔（日数） [1, 3, 7, 14, 30] (必須)
  "lastUpdated": "timestamp",   // 最終更新日時 (必須)
  "createdAt": "timestamp"      // 作成日時 (必須)
}
```

### 3.6 users コレクション（将来拡張用）1 Firestore採用理由

- **リアルタイム同期**: チャット機能に適している
- **スケーラビリティ**: 自動スケーリング
- **セキュリティ**: セキュリティルールによる細かい制御
- **Firebase連携**: Authenticationとの連携が容易

## 3. コレクション設計

### 3.1 chatSessions コレクション

**パス**: `/chatSessions/{sessionId}`

```javascript
{
  // ドキュメントID: 自動生成されるセッションID
  "userId": "string",           // ユーザーID (必須)
  "title": "string",            // セッションタイトル (オプション)
  "createdAt": "timestamp",     // 作成日時 (必須)
  "updatedAt": "timestamp",     // 更新日時 (必須)
  "messages": [                 // メッセージ配列 (必須)
    {
      "role": "string",         // "user" or "model"
      "parts": [                // メッセージ部分の配列
        {
          "text": "string"      // テキスト内容
        }
      ],
      "timestamp": "timestamp"  // メッセージ送信時刻
    }
  ]
}
```

### 3.2 users コレクション（将来拡張用）

**パス**: `/users/{userId}`

```javascript
{
  // ドキュメントID: Firebase AuthenticationのUID
  "email": "string",            // メールアドレス
  "displayName": "string",      // 表示名
  "createdAt": "timestamp",     // アカウント作成日時
  "lastLoginAt": "timestamp",   // 最終ログイン日時
  "preferences": {              // ユーザー設定
    "theme": "string",          // "light" | "dark"
    "language": "string",       // "ja" | "en"
    "notifications": "boolean"  // 通知設定
  },
  "statistics": {               // 学習統計（将来拡張）
    "totalSessions": "number",  // 総セッション数
    "totalMessages": "number",  // 総メッセージ数
    "lastActivity": "timestamp" // 最終活動日時
  }
}
```

### 3.3 learningRecords コレクション（フェーズ4連携用）

**パス**: `/learningRecords/{recordId}`

```javascript
{
  "userId": "string",           // ユーザーID
  "sessionId": "string",        // 関連セッションID
  "subject": "string",          // 教科 ("math", "science", etc.)
  "topic": "string",            // トピック
  "difficulty": "string",       // 難易度 ("easy", "medium", "hard")
  "duration": "number",         // 学習時間（分）
  "completedAt": "timestamp",   // 完了日時
  "summary": "string",          // 学習内容サマリー
  "achievements": [             // 達成項目
    "string"
  ]
}
```

## 4. インデックス設計

### 4.1 複合インデックス

```javascript
// chatSessions コレクション
[
  {
    "collectionGroup": "chatSessions",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" },
      { "fieldPath": "updatedAt", "order": "DESCENDING" }
    ]
  }
]

// learningRecords コレクション
[
  {
    "collectionGroup": "learningRecords",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" },
      { "fieldPath": "completedAt", "order": "DESCENDING" }
    ]
  },
  {
    "collectionGroup": "learningRecords",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" },
      { "fieldPath": "subject", "order": "ASCENDING" },
      { "fieldPath": "completedAt", "order": "DESCENDING" }
    ]
  }
]

// reminders コレクション
[
  {
    "collectionGroup": "reminders",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" },
      { "fieldPath": "scheduledAt", "order": "ASCENDING" }
    ]
  },
  {
    "collectionGroup": "reminders",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "scheduledAt", "order": "ASCENDING" }
    ]
  }
]
```

## 5. セキュリティルール

### 5.1 firestore.rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // chatSessions の読み書きルール
    match /chatSessions/{sessionId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // users の読み書きルール
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // learningRecords の読み書きルール
    match /learningRecords/{recordId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // reminders の読み書きルール
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }

    // reminderSettings の読み書きルール
    match /reminderSettings/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

## 6. クエリパターン

### 6.1 主要なクエリ

```typescript
// 1. ユーザーのセッション一覧取得（最新順）
const getUserSessions = (userId: string) => {
  return db.collection('chatSessions')
    .where('userId', '==', userId)
    .orderBy('updatedAt', 'desc')
    .limit(20);
};

// 2. 特定セッションの取得
const getSession = (sessionId: string) => {
  return db.collection('chatSessions').doc(sessionId);
};

// 3. セッション作成
const createSession = (sessionData: Omit<ChatSession, 'id'>) => {
  return db.collection('chatSessions').add(sessionData);
};

// 4. メッセージ追加（セッション更新）
const updateSession = (sessionId: string, updates: Partial<ChatSession>) => {
  return db.collection('chatSessions').doc(sessionId).update(updates);
};
```

### 6.2 将来拡張用クエリ

```typescript
// 学習記録の取得（日付範囲）
const getLearningRecords = (userId: string, startDate: Date, endDate: Date) => {
  return db.collection('learningRecords')
    .where('userId', '==', userId)
    .where('completedAt', '>=', startDate)
    .where('completedAt', '<=', endDate)
    .orderBy('completedAt', 'desc');
};

// 教科別学習記録
const getLearningRecordsBySubject = (userId: string, subject: string) => {
  return db.collection('learningRecords')
    .where('userId', '==', userId)
    .where('subject', '==', subject)
    .orderBy('completedAt', 'desc')
    .limit(10);
};
```

## 7. データ制約

### 7.1 サイズ制限

- **ドキュメントサイズ**: 最大1MB
- **配列フィールド**: 最大20,000要素
- **文字列フィールド**: 最大1,048,487バイト

### 7.2 チャットセッション制約

- **メッセージ配列**: 最大500メッセージ
- **メッセージテキスト**: 最大10,000文字
- **セッションタイトル**: 最大100文字

### 7.3 パフォーマンス考慮

- 大量のメッセージを持つセッションは、サブコレクション化を検討
- リアルタイムリスナーの効率的な使用

## 8. バックアップ・復旧戦略

### 8.1 自動バックアップ

Firebase標準のバックアップ機能を使用:
- 日次自動バックアップ
- 保持期間: 30日

### 8.2 データエクスポート

```bash
# Firestoreデータのエクスポート
gcloud firestore export gs://backup-bucket/exports/$(date +%Y%m%d)
```

## 9. 監視・メトリクス

### 9.1 監視項目

- 読み取り/書き込み操作数
- エラー率
- レスポンス時間
- ストレージ使用量

### 9.2 アラート設定

- 異常なアクセス増加
- エラー率の上昇
- ストレージ容量の逼迫

## 10. マイグレーション計画

### 10.1 スキーマ変更戦略

1. **後方互換性の維持**
2. **段階的移行**
3. **ロールバック計画**

### 10.2 データ移行スクリプト例

```typescript
// メッセージ形式変更時の移行例
const migrateMessageFormat = async () => {
  const sessions = await db.collection('chatSessions').get();

  for (const doc of sessions.docs) {
    const data = doc.data();
    const updatedMessages = data.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || new Date()
    }));

    await doc.ref.update({ messages: updatedMessages });
  }
};
```
