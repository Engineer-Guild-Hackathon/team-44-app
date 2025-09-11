# AI学習支援の高度化機能

## 概要

このドキュメントでは、AI学習支援システムに追加された高度な機能について説明します：

1. **プロンプトチューニング** - 認知科学に基づく高度な学習支援プロンプト
2. **エージェント機能** - Google検索を活用した知識補完

## 1. 高度な学習支援プロンプト

### 特徴

- **認知科学ベース**: Socratic Method、Scaffolding、Active Learningなどの科学的学習理論を実装
- **個別化対応**: 学習者のレベルと学習スタイルに応じた対応
- **メタ認知促進**: 学習プロセス自体を意識させる仕組み
- **科目別特化**: 数学、科学、言語学習それぞれに特化したガイドライン

### 実装詳細

```typescript
// 基本的な使用方法
import { getEnhancedPrompt } from './enhancedPrompts';

// 一般的な学習支援プロンプト
const generalPrompt = getEnhancedPrompt();

// 数学特化プロンプト
const mathPrompt = getEnhancedPrompt('mathematics');

// 科学特化プロンプト
const sciencePrompt = getEnhancedPrompt('science');

// 言語学習特化プロンプト
const languagePrompt = getEnhancedPrompt('language');
```

### 主な学習戦略

#### Socratic Method（ソクラテス式問答法）
- 直接答えを教えず、適切な質問で導く
- 学習者の思考プロセスを活性化

#### Scaffolding（足場理論）
- 学習者の現在レベルを把握
- 段階的な難易度調整
- 適切なサポートの提供

#### メタ認知の促進
- 思考プロセスの意識化
- 学習戦略の振り返り
- 自己評価とモニタリング

## 2. Google検索エージェント機能

### 概要

AIが必要に応じてGoogle検索を実行し、最新情報や詳細な説明を提供する機能です。

### 機能詳細

#### 自動検索判定
AIが以下の要素から検索の必要性を判断：

- **検索が有用なキーワード**: 最新、詳しく、参考、実例など
- **複雑な質問**: なぜ、どのように、などの深い理解が必要な質問
- **簡単なタスクは除外**: 基本的な計算や直接的な答えが明確な質問

#### 検索結果の統合
- 関連する情報を3件まで取得
- AI応答に自然に統合
- 学習コンテキストに応じた検索クエリ生成

### 設定方法

#### 環境変数の設定

```bash
# Google Search API設定
GOOGLE_SEARCH_API_KEY="your_google_search_api_key_here"
GOOGLE_SEARCH_ENGINE_ID="your_custom_search_engine_id_here"
```

#### Google Search APIの取得方法

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Custom Search JSON APIを有効化
3. APIキーを作成
4. [Programmable Search Engine](https://programmablesearchengine.google.com/)でカスタム検索エンジンを作成
5. 検索エンジンIDを取得

### 使用例

```typescript
import { GoogleSearchService } from './googleSearchService';

const searchService = new GoogleSearchService();

// 検索可能かチェック
if (searchService.isAvailable()) {
  // 検索実行
  const results = await searchService.search('二次関数 解き方');
  
  // 結果をフォーマット
  const formatted = searchService.formatSearchResults(results);
}
```

## 3. 学習コンテキストの活用

### 機能
- 学習履歴からユーザーレベルを推定
- 学習分野・トピックに応じた専門対応
- 難易度の自動調整

### 実装
```typescript
interface LearningContext {
  subject?: string;        // 学習分野（数学、英語等）
  topic?: string;          // 具体的なトピック
  difficulty?: number;     // 難易度レベル（1-5）
  userLevel?: string;      // ユーザーレベル（初級、中級、上級）
}

// LLMプロバイダーでの使用
const response = await provider.generateResponse(
  history, 
  newMessage, 
  learningContext
);
```

## 4. パフォーマンスと制限

### Google Search API制限
- 1日100回まで無料
- 超過時は検索機能が無効化される
- エラー時はログに記録され、通常の応答に切り替わる

### セキュリティ考慮事項
- APIキーは環境変数で管理
- 検索結果は安全なサイトのみ（safe searchオン）
- 日本語コンテンツを優先

## 5. 今後の拡張予定

### 追加予定機能
- 画像検索対応
- ウィキペディア直接連携
- 学術論文検索
- YouTube動画検索
- 多言語対応

### 改善予定
- より精密な検索トリガー判定
- 検索結果の品質評価
- ユーザーフィードバック基づく最適化