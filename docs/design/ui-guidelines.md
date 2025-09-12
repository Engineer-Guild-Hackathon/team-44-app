# UI デザインガイドライン

## カラーテーマ

このプロジェクトでは、globals.css で定義された CSS カスタムプロパティを使用して、ライトモードとダークモードを自動的に切り替えるデザインを採用しています。

### 基本原則
- **ダークモードを意識せずに色を指定する**: すべての色は CSS 変数 (`--color-*`) を使用し、ダークモードの切り替えは自動的に行われます。
- **ハードコードされた色を使用しない**: `bg-white`, `text-gray-900`, `dark:` などのクラスは使用せず、CSS 変数に統一します。

### 使用する CSS 変数
- `--color-bg-light`: 背景色（ライトモード）
- `--color-bg-dark`: 背景色（ダークモード）
- `--color-text-light`: テキスト色（ライトモード）
- `--color-text-dark`: テキスト色（ダークモード）
- `--color-primary`: プライマリカラー
- `--color-secondary`: セカンダリカラー
- `--color-accent`: アクセントカラー
- `--color-border`: ボーダー色
- `--color-muted`: ミュートカラー
- `--color-muted-foreground`: ミュートテキスト色
- `--color-success`: 成功色
- `--color-warning`: 警告色
- `--color-error`: エラー色
- `--color-info`: 情報色

### 使用例
```tsx
// 正しい使用例
<div className="bg-[var(--color-bg-light)] text-[var(--color-text-light)] border border-[var(--color-border)]">
  コンテンツ
</div>

// 避けるべき例
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  コンテンツ
</div>
```

## アイコン

### 基本原則
- **絵文字を使用しない**: すべてのアイコンは react-icons を使用します。
- **一貫したアイコンセットを使用**: Material Design Icons (Md*) を主に使用します。

### アイコンのインポート
```tsx
import { MdMenuBook, MdPsychology, MdMap } from 'react-icons/md';
```

### アイコンの使用例
- 📚 → `<MdMenuBook />`
- 🧠 → `<MdPsychology />`
- 🗺️ → `<MdMap />`
- ❓ → `<MdHelp />`
- 🌟 → `<MdStar />`

### カテゴリ別アイコン
学習カテゴリに応じたアイコン:
- 数学: `<MdCalculate />`
- 物理/化学: `<MdScience />`
- 英語/言語: `<MdLanguage />`
- 歴史: `<MdHistory />`
- プログラミング: `<MdCode />`
- 一般/文学: `<MdMenuBook />`

## レスポンシブデザイン

### モバイル対応
- カレンダーポップアップなどのモーダルは、スマホで幅を広くし、レイアウトを縦並びに調整します。
- Tailwind のレスポンシブクラス (`md:`, `lg:`) を活用します。

### 例: ポップアップのレスポンシブ
```tsx
<div className="flex flex-col md:flex-row h-full">
  <div className="w-full md:w-1/3">左パネル</div>
  <div className="w-full md:flex-1">右パネル</div>
</div>
```

## コンポーネントの統一

### ボタン
- プライマリボタン: `bg-[var(--color-primary)] text-[var(--color-text-dark)]`
- セカンダリボタン: `border border-[var(--color-primary)] text-[var(--color-primary)]`

### 入力フィールド
- `border border-[var(--color-border)] bg-[var(--color-bg-light)] text-[var(--color-text-light)]`

### メッセージバブル
- ユーザー: `bg-[var(--color-primary)] text-[var(--color-text-dark)]`
- AI: `bg-[var(--color-muted)] text-[var(--color-text-light)]`

これらのガイドラインに従うことで、一貫したデザインとダークモード対応を実現します。
