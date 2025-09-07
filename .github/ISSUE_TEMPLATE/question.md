---
name: ❓ 質問
description: 質問やサポートを求める
title: "[QUESTION] "
labels: ["question", "help-wanted"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## ❓ 質問

        質問ありがとうございます！できる限り迅速にお答えします。

        **注意**: 一般的な質問やサポート依頼の場合は、[Discordコミュニティ](https://discord.gg/your-server)や[ドキュメント](https://github.com/Engineer-Guild-Hackathon/team-44-app/blob/main/README.md)もご活用ください。

  - type: dropdown
    id: question-type
    attributes:
      label: 質問の種類
      description: 質問の種類を選択してください。
      options:
        - 使い方について
        - 技術的な質問
        - セットアップ/インストール
        - バグの可能性
        - 機能の仕様について
        - その他
    validations:
      required: true

  - type: textarea
    id: question
    attributes:
      label: 質問内容
      description: 質問を詳しく記載してください。背景情報や具体的な状況も含めると回答がしやすくなります。
      placeholder: |
        例）
        AI学習サポートアプリの使い方を教えてください。
        特に、チャット機能でどのような質問ができるのか知りたいです。
    validations:
      required: true

  - type: textarea
    id: context
    attributes:
      label: 背景情報
      description: 質問の背景や状況を説明してください。
      placeholder: |
        - 何をしようとしているのか
        - どのようなエラーが発生しているのか
        - どのような結果を期待しているのか
        - 試したことのある解決方法
    validations:
      required: false

  - type: input
    id: environment
    attributes:
      label: 環境情報
      description: 使用している環境情報を記載してください。
      placeholder: Chrome 120.0.0, macOS 14.0, Node.js 20.10.0
    validations:
      required: false

  - type: textarea
    id: additional-info
    attributes:
      label: 追加情報
      description: 関連するスクリーンショット、ログ、コードなどがあれば記載してください。
      placeholder: |
        - スクリーンショット
        - コンソールログ
        - 設定ファイルの内容
        - 関連するドキュメントへのリンク

  - type: checkboxes
    id: checklist
    attributes:
      label: チェックリスト
      description: 以下の項目を確認してください。
      options:
        - label: ドキュメントを確認しました
          required: true
        - label: 同様の質問が既に存在しないことを確認しました
          required: true
        - label: 個人情報や機密情報が含まれていないことを確認しました
          required: true
