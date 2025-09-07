---
name: 🐛 バグレポート
description: バグや不具合を報告する
title: "[BUG] "
labels: ["bug", "triage"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## 🐛 バグレポート

        バグを報告していただきありがとうございます！正確な情報提供により、迅速な修正が可能になります。

  - type: textarea
    id: description
    attributes:
      label: バグの説明
      description: 何が起こったのか、どのような動作を期待していたのかを詳しく説明してください。
      placeholder: 例）チャットページでメッセージを送信すると、エラーが発生します。
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: 再現手順
      description: バグを再現するための手順をステップバイステップで記載してください。
      placeholder: |
        1. ホームページにアクセス
        2. 「学習を始める」ボタンをクリック
        3. メッセージを入力して送信
        4. エラーが発生
    validations:
      required: true

  - type: textarea
    id: expected-behavior
    attributes:
      label: 期待される動作
      description: 正常な動作として期待される結果を説明してください。
      placeholder: 例）メッセージが正常に送信され、AIからの応答が表示される
    validations:
      required: true

  - type: textarea
    id: actual-behavior
    attributes:
      label: 実際の動作
      description: 実際に起こった動作を説明してください。
      placeholder: 例）エラーメッセージが表示され、メッセージが送信されない
    validations:
      required: true

  - type: dropdown
    id: severity
    attributes:
      label: 深刻度
      description: このバグの深刻度を選択してください。
      options:
        - 致命的 (Critical) - アプリが使用不能
        - 重大 (Major) - 主要機能が使用不能
        - 中程度 (Moderate) - 一部の機能が使用不能
        - 軽微 (Minor) - 軽微な問題
        - 提案 (Suggestion) - 改善提案
    validations:
      required: true

  - type: input
    id: environment
    attributes:
      label: 環境情報
      description: 使用しているブラウザ、OS、Node.jsバージョンなどを記載してください。
      placeholder: Chrome 120.0.0, macOS 14.0, Node.js 20.10.0
    validations:
      required: true

  - type: textarea
    id: additional-context
    attributes:
      label: 追加情報
      description: バグに関連する追加情報があれば記載してください。
      placeholder: |
        - スクリーンショット
        - コンソールログ
        - 関連するIssue/PR
        - その他の関連情報

  - type: checkboxes
    id: checklist
    attributes:
      label: チェックリスト
      description: 以下の項目を確認してください。
      options:
        - label: このバグは最新バージョンでも発生します
          required: true
        - label: 同様のIssueが既に存在しないことを確認しました
          required: true
        - label: 個人情報や機密情報が含まれていないことを確認しました
          required: true
