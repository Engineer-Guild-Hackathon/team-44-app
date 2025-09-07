# テスト設計書

## 1. 概要

AI学習サポート機能のテスト戦略とテスト設計を定義します。

## 2. テスト戦略

### 2.1 テストピラミッド

```
        E2E Tests (10%)
    ┌─────────────────────┐
    │  ユーザーシナリオ     │
    └─────────────────────┘
      Integration Tests (20%)
  ┌─────────────────────────┐
  │   API・DB・外部サービス   │
  └─────────────────────────┘
        Unit Tests (70%)
┌─────────────────────────────┐
│ 関数・コンポーネント・クラス │
└─────────────────────────────┘
```

### 2.2 テスト方針

- **単体テスト**: 各関数、クラス、コンポーネントの動作を検証
- **統合テスト**: API、データベース、外部サービス間の連携を検証
- **E2Eテスト**: ユーザーの利用シナリオを端到端で検証

## 3. フロントエンドテスト

### 3.1 テスト環境

- **テストランナー**: Jest
- **テストライブラリ**: React Testing Library
- **モック**: Jest Mock Functions

### 3.2 コンポーネントテスト

#### 3.2.1 ChatView コンポーネント

```typescript
// tests/components/ChatView.test.tsx
import { render, screen } from '@testing-library/react';
import ChatView from '@/components/common/ChatView';
import { ChatMessage } from '@/types/api';

describe('ChatView', () => {
  const mockMessages: ChatMessage[] = [
    {
      role: 'user',
      parts: [{ text: 'こんにちは' }],
      timestamp: new Date('2024-01-01T12:00:00Z')
    },
    {
      role: 'model',
      parts: [{ text: 'こんにちは！何か質問はありますか？' }],
      timestamp: new Date('2024-01-01T12:01:00Z')
    }
  ];

  test('メッセージが正しく表示される', () => {
    render(<ChatView messages={mockMessages} />);

    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText('こんにちは！何か質問はありますか？')).toBeInTheDocument();
  });

  test('空のメッセージ時に案内文が表示される', () => {
    render(<ChatView messages={[]} />);

    expect(screen.getByText('新しい学習セッションを開始しましょう！')).toBeInTheDocument();
  });

  test('ローディング状態が表示される', () => {
    render(<ChatView messages={[]} isLoading={true} />);

    expect(screen.getByText('AIが考えています...')).toBeInTheDocument();
  });
});
```

#### 3.2.2 MessageInput コンポーネント

```typescript
// tests/components/MessageInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from '@/components/common/MessageInput';

describe('MessageInput', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('メッセージ入力と送信ができる', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    await user.type(textarea, 'テストメッセージ');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('テストメッセージ');
  });

  test('Enterキーで送信できる', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');

    await user.type(textarea, 'テストメッセージ');
    await user.keyboard('{Enter}');

    expect(mockOnSendMessage).toHaveBeenCalledWith('テストメッセージ');
  });

  test('空のメッセージは送信できない', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const sendButton = screen.getByRole('button', { name: '送信' });

    await user.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });
});
```

### 3.3 フックテスト

#### 3.3.1 useAuth フック

```typescript
// tests/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';

// Firebase Auth のモック
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn()
  }
}));

describe('useAuth', () => {
  test('初期状態では未ログイン', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  test('ログイン処理が正常に動作する', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'test@example.com',
      'password'
    );
  });
});
```

### 3.4 ストアテスト

#### 3.4.1 ChatStore テスト

```typescript
// tests/store/chatStore.test.ts
import { useChatStore } from '@/store/chatStore';
import { ChatMessage } from '@/types/api';

describe('ChatStore', () => {
  beforeEach(() => {
    // ストアをリセット
    useChatStore.setState({
      currentSession: null,
      sessions: [],
      isLoading: false,
      error: null
    });
  });

  test('メッセージを追加できる', () => {
    const message: ChatMessage = {
      role: 'user',
      parts: [{ text: 'テストメッセージ' }],
      timestamp: new Date()
    };

    // 現在のセッションを設定
    useChatStore.getState().setCurrentSession({
      id: 'test-session',
      userId: 'test-user',
      title: 'テストセッション',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    });

    // メッセージを追加
    useChatStore.getState().addMessage(message);

    const currentSession = useChatStore.getState().currentSession;
    expect(currentSession?.messages).toHaveLength(1);
    expect(currentSession?.messages[0]).toEqual(message);
  });
});
```

## 4. バックエンドテスト

### 4.1 テスト環境

- **テストランナー**: Jest
- **モック**: Jest Mock Functions
- **Firestore**: Firebase Emulator

### 4.2 サービステスト

#### 4.2.1 ChatService テスト

```typescript
// tests/services/chatService.test.ts
import { ChatService } from '@/services/chatService';
import { getLLMProvider } from '@/services/llm/llmFactory';

// LLMプロバイダーのモック
jest.mock('@/services/llm/llmFactory');
const mockLLMProvider = {
  generateResponse: jest.fn()
};
(getLLMProvider as jest.Mock).mockReturnValue(mockLLMProvider);

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
    jest.clearAllMocks();
  });

  test('セッションを作成できる', async () => {
    const sessionId = await chatService.createSession('test-user', 'テストセッション');

    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe('string');
  });

  test('メッセージを送信できる', async () => {
    mockLLMProvider.generateResponse.mockResolvedValue('AIからの応答');

    // セッションを先に作成
    const sessionId = await chatService.createSession('test-user');

    const response = await chatService.sendMessage(
      sessionId,
      'test-user',
      'こんにちは'
    );

    expect(response).toBe('AIからの応答');
    expect(mockLLMProvider.generateResponse).toHaveBeenCalledWith(
      [],
      'こんにちは'
    );
  });

  test('存在しないセッションにメッセージを送信するとエラー', async () => {
    await expect(
      chatService.sendMessage('nonexistent', 'test-user', 'メッセージ')
    ).rejects.toThrow('チャットセッションが見つかりません');
  });
});
```

#### 4.2.2 LLMProvider テスト

```typescript
// tests/services/llm/geminiProvider.test.ts
import { GeminiProvider } from '@/services/llm/geminiProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Generative AI のモック
jest.mock('@google/generative-ai');

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockModel: any;
  let mockChat: any;

  beforeEach(() => {
    mockChat = {
      sendMessage: jest.fn()
    };

    mockModel = {
      startChat: jest.fn().mockReturnValue(mockChat)
    };

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    }));

    provider = new GeminiProvider('test-api-key');
  });

  test('AIからの応答を取得できる', async () => {
    const mockResponse = {
      response: {
        text: () => 'AIからの応答'
      }
    };

    mockChat.sendMessage.mockResolvedValue(mockResponse);

    const result = await provider.generateResponse([], 'こんにちは');

    expect(result).toBe('AIからの応答');
    expect(mockChat.sendMessage).toHaveBeenCalledWith('こんにちは');
  });

  test('APIエラー時に適切なエラーを投げる', async () => {
    mockChat.sendMessage.mockRejectedValue(new Error('API Error'));

    await expect(
      provider.generateResponse([], 'こんにちは')
    ).rejects.toThrow('AI応答の生成に失敗しました');
  });
});
```

### 4.3 APIテスト

#### 4.3.1 Controller テスト

```typescript
// tests/controllers/chatController.test.ts
import { Request, Response } from 'express';
import { createSession, postMessage } from '@/controllers/chatController';
import { ChatService } from '@/services/chatService';

// ChatService のモック
jest.mock('@/services/chatService');

describe('ChatController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockChatService: jest.Mocked<ChatService>;

  beforeEach(() => {
    mockRequest = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockChatService = new ChatService() as jest.Mocked<ChatService>;
  });

  test('セッション作成APIが正常に動作する', async () => {
    mockRequest.body = { title: 'テストセッション' };
    mockChatService.createSession.mockResolvedValue('session-123');

    await createSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      sessionId: 'session-123',
      message: 'チャットセッションが作成されました'
    });
  });

  test('認証エラー時に401を返す', async () => {
    mockRequest.headers = {}; // 認証ヘッダーなし

    await createSession(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: '認証トークンが必要です'
    });
  });
});
```

## 5. 統合テスト

### 5.1 API統合テスト

```typescript
// tests/integration/api.test.ts
import request from 'supertest';
import { app } from '@/index';

describe('API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // テスト用の認証トークンを取得
    authToken = await getTestAuthToken();
  });

  test('チャットセッション作成から メッセージ送信まで', async () => {
    // 1. セッション作成
    const createResponse = await request(app)
      .post('/chatSessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'テストセッション' })
      .expect(201);

    const sessionId = createResponse.body.sessionId;

    // 2. メッセージ送信
    const messageResponse = await request(app)
      .post(`/chatSessions/${sessionId}/messages`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'こんにちは' })
      .expect(200);

    expect(messageResponse.body.response).toBeDefined();
    expect(messageResponse.body.sessionId).toBe(sessionId);

    // 3. セッション取得
    const getResponse = await request(app)
      .get(`/chatSessions/${sessionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getResponse.body.session.messages).toHaveLength(2); // user + model
  });
});
```

## 6. E2Eテスト

### 6.1 テスト環境

- **ツール**: Playwright
- **ブラウザ**: Chrome, Firefox, Safari

### 6.2 E2Eテストシナリオ

```typescript
// tests/e2e/chat-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('チャット機能', () => {
  test('ユーザーがチャットでAIと対話できる', async ({ page }) => {
    // 1. ログインページにアクセス
    await page.goto('/auth');

    // 2. ログイン
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("ログイン")');

    // 3. チャットページに移動
    await page.waitForURL('/chat');

    // 4. メッセージを入力して送信
    await page.fill('textarea', '数学の二次方程式について教えてください');
    await page.click('button:has-text("送信")');

    // 5. AIからの応答を確認
    await expect(page.locator('.chat-message')).toContainText('二次方程式');

    // 6. 追加の質問
    await page.fill('textarea', 'もう少し詳しく教えてください');
    await page.click('button:has-text("送信")');

    // 7. 対話が継続されることを確認
    await expect(page.locator('.chat-message')).toHaveCount(4); // user + model の2回分
  });

  test('セッション一覧が表示される', async ({ page }) => {
    await page.goto('/chat');

    // セッション一覧が表示されることを確認
    await expect(page.locator('[data-testid="session-list"]')).toBeVisible();

    // 新しいセッションを作成
    await page.click('button:has-text("新しいセッション")');

    // セッション一覧に新しいセッションが追加されることを確認
    await expect(page.locator('[data-testid="session-item"]')).toHaveCount(1);
  });
});
```

## 7. パフォーマンステスト

### 7.1 ロードテスト

```typescript
// tests/performance/load.test.ts
import { test } from '@playwright/test';

test.describe('パフォーマンステスト', () => {
  test('大量のメッセージを含むセッションでも正常に表示される', async ({ page }) => {
    // 100件のメッセージを持つセッションをセットアップ
    await setupSessionWithManyMessages(100);

    const startTime = Date.now();
    await page.goto('/chat/session-with-many-messages');

    // 3秒以内に読み込まれることを確認
    await expect(page.locator('.chat-view')).toBeVisible();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
```

## 8. テスト自動化

### 8.1 CI/CD パイプライン

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Start Firebase Emulators
        run: |
          npm install -g firebase-tools
          firebase emulators:start --detached

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Playwright
        run: npx playwright install

      - name: Run E2E tests
        run: npm run test:e2e
```

## 9. テストデータ管理

### 9.1 テストデータセットアップ

```typescript
// tests/setup/testData.ts
export const createTestUser = () => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'テストユーザー'
});

export const createTestSession = () => ({
  id: 'test-session-123',
  userId: 'test-user-123',
  title: 'テストセッション',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T01:00:00Z'),
  messages: [
    {
      role: 'user' as const,
      parts: [{ text: 'こんにちは' }],
      timestamp: new Date('2024-01-01T00:30:00Z')
    },
    {
      role: 'model' as const,
      parts: [{ text: 'こんにちは！何か質問はありますか？' }],
      timestamp: new Date('2024-01-01T00:31:00Z')
    }
  ]
});
```

## 10. テスト品質管理

### 10.1 カバレッジ目標

- **単体テスト**: 80%以上
- **統合テスト**: 主要APIエンドポイント100%
- **E2Eテスト**: 主要ユーザーフロー100%

### 10.2 テストレビュー基準

- テストケースの網羅性
- テストコードの可読性
- モックの適切性
- パフォーマンスへの影響
