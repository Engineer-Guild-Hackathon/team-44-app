# PRD: チャットセッションと LearningRecord の生成タイミング

## 概要
チャットセッション作成時に即座に学習記録（LearningRecord）を作成する現在の挙動を変更し、以下を実現する。
- チャットセッションは作成時に `draft` 状態で保持する（既存仕様）。
- 一定条件（アクティブ化条件）を満たしたときにのみ、対応する LearningRecord を作成または既存の LearningRecord に紐付ける。
- 条件を満たさない `draft` は1時間以上経過した場合に自動削除される（既存 CF の機能継続）。
- LearningRecord の subject/topic は当該チャットセッションのメタデータを LLM で解析して推定し、必要に応じて既存の当日レコードに結合する。

## 目的（成功基準）
- draft のままの無意味な LearningRecord がカレンダーに表示されないこと。
- 実際に十分な会話が行われたセッションのみが LearningRecord を生成・更新されること。
- 同日に類似トピックのレコードが存在する場合は重複して新規作成しないこと。既存の LearningRecord に紐付ける。

## TODOリスト（設計・実装で必要な作業）
- [ ] 設計: LLM推定プロンプトの詳細定義とテストケース作成。
- [ ] 設計: 類似度アルゴリズムの詳細仕様（閾値、計算方法）。
- [ ] 設計: トランザクション処理の詳細フローとエラー処理。
- [ ] 設計: ログ保存先とフォーマットの決定。
- [ ] 実装: `chatService.ts` の昇格処理にLearningRecord作成ロジック追加。
- [ ] 実装: `learningRecordService.ts` にLLM推定と既存レコード検索メソッド追加。
- [ ] 実装: `types.ts` に推定メタフィールド追加。
- [ ] 実装: クライアント側カレンダーにstatusフィルタ追加。
- [ ] テスト: 各コンポーネントのユニットテスト作成。
- [ ] テスト: 統合テスト（セッション昇格→LearningRecord作成）。
- [ ] 運用: 監査ログの収集・監視設定。

## 参照ファイルと背景情報
- 主要情報ソース: `functions/src/services/chatService.ts` (セッション昇格ロジック), `functions/src/services/learningRecordService.ts` (LearningRecord作成), `functions/src/controllers/chatController.ts` (APIエンドポイント), `functions/src/models/types.ts` (データモデル), `web/app/calendar/page.tsx` (カレンダー表示), `web/lib/apiClient.ts` (APIクライアント).
- 関連設計ファイル: `docs/prd/v1_2.md`, `docs/prd/v1.md` (既存PRD), `docs/design/test-design.md` (テスト設計).
- 実装ファイル書き込み先: 上記ファイルに修正を加える。新しいファイルは作成しない。

## 抽出された要件
- 要件1: チャットセッション生成時は LearningRecord を生成しないこと（例外は許容しない）。
- 要件2: セッションが「アクティブ化条件」を満たした時点で LearningRecord を作成、または既存の当日レコードを再利用して session に ID を格納すること。
- 要件3: アクティブ化条件は以下を満たすこと（既存ロジックと整合性を保つ）: メッセージ数 >= 4 または経過時間 >= 3 分（現行の推奨条件を踏襲）。具体条件は実装時にパラメータ化可能とする。
- 要件4: LearningRecord の subject/topic は LLM による推定を用いること。推定にはセッションのメタデータ（タイトル、sessionSummary、主要メッセージ等）を使用する。
- 要件5: LLM の推定結果には信頼度（confidence）を付与する。既存レコード再利用判断は confidence と類似度（当日レコードの topic/subject 比較）で行う。
- 要件6: 当日内に既存レコードが存在し、LLM 推定がそのレコードに十分一致すると判断した場合、新規作成は行わず既存の LearningRecord の ID をチャットセッションに設定する。
- 要件7: LearningRecord 作成は一度だけ行い、重複作成を防ぐためにトランザクションまたは同等の排他制御を行うこと。
- 要件8: 監査ログとして、LLM 推定結果（subject/topic/confidence）と採用された decision（新規作成 / 既存紐付け）を保存する（簡易ログ可）。
- 要件9: カレンダー表示側（`getLearningRecordsForPeriod`）は status フィルタ（`active` のみ）をサポートすることを推奨する。

## 非機能要件
- レイテンシ: LLM 呼び出しはバックグラウンドで非同期に処理できる設計とする。即時同期での遅延を最小化する。
- 耐障害性: LLM 呼び出しが失敗してもセッションの昇格（`active`）自体は行い、手動または後続ジョブで LearningRecord を作成できる設計にする。
- 一貫性: 同時実行を防ぐため、Firestore トランザクション（または分散ロック）を用いる。
- 追跡性: ログおよびメトリクス（生成成功率、LLM failure rate、重複検出率）を収集する。

## データ設計上の検討（選択肢と推奨）
- 選択肢A: `chatSessions` ドキュメントに `learningRecordId?: string` を持たせる（現在の実装に近い）。
  - 長所: セッションから直接レコードを参照しやすい。クエリが簡単。
  - 短所: 1:N 関係を表現する場合、学習記録側で関連セッションを一覧するには逆方向クエリが必要。
- 選択肢B: `learningRecords` ドキュメントに `chatSessionIds: string[]` を持たせる。
  - 長所: 学習記録中心の集約（どのセッションが関連しているか）を容易に参照できる。
  - 短所: 配列の更新コストと配列サイズの管理（長時間の集約）が発生する。

推奨: 選択肢A を採用。理由: 実運用でセッションから学習記録へ即時アクセスするケースが多く、チャットセッションが単一の学習記録に紐づく運用（典型）を想定するため。必要であれば `learningRecords` に `lastSessionId` や `sessionCount` 等のメタを持たせることで参照性を補える。

## ファイル構造と各コンポーネントの役割
- `functions/src/services/chatService.ts`: チャットセッションの管理、昇格処理、LearningRecordとの連携。
  - 役割: `promoteToActiveSession` でアクティブ化条件チェックとLearningRecord作成/紐付けを実行。
- `functions/src/services/learningRecordService.ts`: LearningRecordの作成、更新、LLM推定、既存レコード検索。
  - 役割: LLMでsubject/topic推定、当日レコードの類似度計算、新規作成または既存紐付け。
- `functions/src/controllers/chatController.ts`: APIエンドポイントの処理。
  - 役割: メッセージ送信時に昇格処理をトリガー。
- `functions/src/models/types.ts`: データモデルの定義。
  - 役割: LearningRecordに推定メタフィールド（estimatedSubject, estimatedTopic, confidence）を追加。
- `web/app/calendar/page.tsx`: カレンダーUI。
  - 役割: LearningRecord取得時にstatusフィルタ適用。
- `web/lib/apiClient.ts`: APIクライアント。
  - 役割: サーバーAPI呼び出し。

## フロー（シーケンス、実行時の振る舞い）
1. ユーザーがチャットセッションを作成 -> `chatSessions` に `status: 'draft'` で保存（現行通り）。LearningRecord は作らない。
2. ユーザーがメッセージを送信し、`messageCount` 等が更新される。
3. メッセージ送信処理内で `shouldPromoteSession(session)` を評価。
   - 条件を満たした場合: セッションを `active` に昇格する前に LearningRecord 処理を行う。
4. LearningRecord 処理（昇格時）:
   a. セッションのメタデータを収集（`title`, `sessionSummary`, 主要メッセージなど）。
   b. LLM に推定を依頼して `subject`, `topic`, `confidence` を取得する（非同期で使える場合は同期的に await しても良いが、タイムアウト/フォールバック戦略を用意）。
   c. 当日（00:00 から現在）に同一ユーザーの LearningRecord を `subject/topic` の類似度基準で検索する（類似度閾値は設定可能、例: confidence >= 0.6 かつ テキスト類似度 >= 0.7）。
   d. 既存レコードがあれば、それを採用して `chatSessions.{sessionId}.learningRecordId` を更新。なければ LearningRecord を新規作成し、その ID をセッションに書き込む。
   e. 上記更新は Firestore トランザクション内で行い、重複作成を防止する。
5. セッションは `active` に更新され、必要に応じて LearningRecord の `lastStudiedAt` や `sessionCount` を更新する。
6. 監査ログに LLM 結果と採用決定を記録する（Cloud Logging または専用コレクション）。

## トランザクション処理の詳細フローとエラー処理
- トランザクション: FirestoreのrunTransactionを使用。
- リトライ戦略: 指数バックオフで最大3回リトライ（1回目: 100ms, 2回目: 200ms, 3回目: 400ms）。
- エラー処理: トランザクション失敗時はログを記録し、昇格処理をスキップ（セッションはdraftのまま）。

## エッジケースと例外処理
- LLM が応答しない／エラー: 昇格は行うが LearningRecord の作成は遅延タスクとしてキューに入れる。
- 同時に複数セッションが同一ユーザーで昇格処理を行った場合: トランザクションで衝突が発生したらリトライまたは既存 ID を採用する。
- 類似度未判定（confidence 低い）: 新規作成を行うか、デフォルトで新規作成するかを設定可能。推奨: confidence >= 0.5 未満なら新規作成する（運用で調整）。
- 学習記録のロールバック: LearningRecord 作成後にセッションが削除された場合は、未使用レコードを後続のクリーンアップジョブで削除する。

## テスト項目（受け入れ基準）
- TC1: チャットセッション作成後、即座に LearningRecord が作られないことを確認。
- TC2: メッセージ送信で条件を満たしたセッションが `active` になり、そのタイミングで LearningRecord が作成されるか、既存レコードに紐付くこと。
- TC3: 同日に類似トピックのレコードがある場合、新規作成ではなく既存 ID が紐付くこと。
- TC4: LLM が失敗した場合、昇格は行われ LearningRecord 作成は保留/リトライされること。
- TC5: トランザクション同時実行で重複 LearningRecord が複数作られないこと。

## 運用 / 監視
- 監査ログ: LLM 推定結果（subject/topic/confidence）と decision を Cloud Logging または `learningRecordLogs` コレクションに記録する。
- メトリクス: LearningRecord 生成成功率、重複率、LLM エラー率をダッシュボードに追加。
- 定期クリーンアップ: 未使用の draft 学習記録（もし誤って作られた場合）を検出して削除するバッチを週次で実行。

## Q&A（確認したい点）
Q1: 推定に使う LLM のプロバイダーと SLA 要件（応答タイムアウト）はどれを想定しますか？（例: OpenAI / Gemini / 内部モック。タイムアウト例: 3s, 10s）
   - 回答: デフォルトでGeminiを使用。タイムアウトは3秒。複雑化しない。
Q2: 当日既存レコードの類似度閾値のデフォルト値はどの程度にしますか？（例: LLM confidence >= 0.6 かつ テキスト類似度 >= 0.7）
   - 回答: 既存レコード一覧をLLMに渡して、似ているレコードがあるかを聞く。LLMの回答に基づいてマッチングを判断。
Q3: LearningRecord を必ず `status: 'active'` で作成する方針でよいですか？それとも初期は `draft` 扱いにする必要がありますか？
   - 回答: LearningRecordのstatusの意味: active（進行中）、completed（完了）、paused（一時停止）。新規作成時はactiveで。
Q4: Logging の保存先は Cloud Logging（推奨）で良いか、または専用 Firestore コレクションに保存する方が望ましいですか？
   - 回答: デフォルトでCloud Loggingを使用。
Q5: LLM推定プロンプトの詳細フォーマットはどのように定義しますか？（例: JSON出力、フィールド指定）
   - 回答: JSON出力で、subject, topic, confidenceフィールドを指定。
Q6: トランザクションのリトライ回数と戦略はどのようにしますか？（例: 指数バックオフ、最大3回）
   - 回答: 指数バックオフで最大3回リトライ。

## 実装案（ファイル/フォルダ対応表）
| 対応するフォルダ | 対応するファイル | 修正内容の概要 |
| --- | --- | --- |
| `functions/src/services` | `chatService.ts` | セッション昇格（`promoteToActiveSession`）の直前で LLM による推定と LearningRecord の作成/既存紐付け処理を実行するロジックを追加。トランザクションでの排他制御を行う。 |
| `functions/src/services` | `learningRecordService.ts` | 新規 LearningRecord 作成 API と、当日レコード検索・類似度判定ロジックを公開するメソッドを追加。LLM を呼ぶためのインターフェースを整備。 |
| `functions/src/controllers` | `chatController.ts` | `sendMessage` / `postMessage` のフローに昇格処理を呼ぶ箇所を明示的に連携（現在の `sendMessageWithStateManagement` を利用）。 |
| `functions/src/models` | `types.ts` | LearningRecord に推定メタ（estimatedSubject, estimatedTopic, confidence, estimationMethod）を保存するためのフィールド定義を追加。 |
| `web/app/calendar` | `page.tsx` | カレンダー表示 API 呼び出し結果を `status === 'active'` でフィルタするオプションを追加（クライアント側での暫定対処）。 |
| `docs/prd` | `chat-session-learningrecord-prd.md` | 本 PRD を配置（このファイル）。 |

## チェックリスト
- [x] TODOリストを含み、設計と実装で何が必要かをカバー。
- [x] 主要情報と関連する設計・実装ファイルへの参照を含むファイルパスを含める。
- [x] 設計と実装ファイルが書き込まれるファイルパスを含める。
- [x] コードを実装しない - 設計と計画のみを提供。
- [x] 必要に応じてQ1, Q2などで質問をユーザーに尋ねる。
- [x] ファイル構造（または関数構造）を説明し、各コンポーネントの役割を説明。
- [x] 明確性や実装可能性を改善するために設計ドキュメントの修正を提案。
- [x] AI支援の実装を可能にするために必要な情報がすべて設計ドキュメントに記載されている。
- [x] AIコード生成ツールで簡単に解析・実行可能な構造にする。

ご確認ください。承認いただければ実装用の差分（具体的な変更点）を作成します。

## 実装案（ファイル/フォルダ対応表）
| 対応するフォルダ | 対応するファイル | 修正内容の概要 |
| --- | --- | --- |
| `functions/src/services` | `chatService.ts` | セッション昇格（`promoteToActiveSession`）の直前で LLM による推定と LearningRecord の作成/既存紐付け処理を実行するロジックを追加。トランザクションでの排他制御を行う。 |
| `functions/src/services` | `learningRecordService.ts` | 新規 LearningRecord 作成 API と、当日レコード検索・類似度判定ロジックを公開するメソッドを追加。LLM を呼ぶためのインターフェースを整備。 |
| `functions/src/controllers` | `chatController.ts` | `sendMessage` / `postMessage` のフローに昇格処理を呼ぶ箇所を明示的に連携（現在の `sendMessageWithStateManagement` を利用）。 |
| `functions/src/models` | `types.ts` | LearningRecord に推定メタ（推定method, confidence, sourceSummary?）を保存するためのフィールド定義を検討・追加。 |
| `web` | カレンダー関連ファイル | カレンダー表示 API 呼び出し結果を `status === 'active'` でフィルタするオプションを追加（クライアント側での暫定対処）。 |
| `docs` | `docs/prd/*-chat-session-learningrecord-prd.md` | 本 PRD を配置（このファイル）。 |

## Q&A（確認したい点）
Q1: 推定に使う LLM のプロバイダーと SLA 要件（応答タイムアウト）はどれを想定しますか？（例: OpenAI / Gemini / 内部モック。タイムアウト例: 3s, 10s）
Q2: 当日既存レコードの類似度閾値のデフォルト値はどの程度にしますか？（例: LLM confidence >= 0.6 かつ テキスト類似度 >= 0.7）
Q3: LearningRecord を必ず `status: 'active'` で作成する方針でよいですか？それとも初期は `draft` 扱いにする必要がありますか？
Q4: Logging の保存先は Cloud Logging（推奨）で良いか、または専用 Firestore コレクションに保存する方が望ましいですか？

---

## チェックリスト
- [ ] No implementation details or code snippets are included.
- [ ] Requirements have been accurately extracted.
- [ ] Requirements have been concisely documented.
- [ ] All necessary information has been included.
- [ ] No necessary details have been omitted.
- [ ] The Japanese Design-docs is clear, easy to understand, and uses bullets or tables effectively.
- [ ] Implementation plan table is included with columns: 対応するフォルダ, 対応するファイル, 修正内容の概要.
- [ ] Questions are clearly labeled as Q1, Q2, etc.

ご確認ください。承認いただければ実装用の差分（具体的な変更点）を作成します。
