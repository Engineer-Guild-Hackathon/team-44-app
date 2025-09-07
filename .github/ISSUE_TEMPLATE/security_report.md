---
name: 🔒 セキュリティレポート
description: セキュリティ関連の問題を報告する
title: "[SECURITY] "
labels: ["security", "urgent"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## 🔒 セキュリティレポート

        セキュリティの問題を報告していただきありがとうございます。このレポートは開発チームに直接通知されます。

        **重要**: セキュリティの問題は公開せずに、開発チームに直接連絡することを推奨します。

  - type: textarea
    id: summary
    attributes:
      label: 問題の概要
      description: セキュリティ問題の概要を説明してください。詳細は次のフィールドで記載してください。
      placeholder: 例）APIキー漏洩の可能性
    validations:
      required: true

  - type: dropdown
    id: severity
    attributes:
      label: 深刻度
      description: セキュリティ問題の深刻度を評価してください。
      options:
        - 緊急 (Critical) - 即時対応が必要
        - 高 (High) - 早急な対応が必要
        - 中 (Medium) - 対応が必要
        - 低 (Low) - 優先度は低い
        - 情報 (Info) - 参考情報
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: 詳細な説明
      description: 問題の詳細な説明を記載してください。攻撃手法、再現手順、影響範囲などを含めてください。
      placeholder: |
        問題の詳細：
        - どのような脆弱性か
        - どのように悪用される可能性があるか
        - 影響を受ける範囲
        - 再現手順（可能であれば）
    validations:
      required: true

  - type: textarea
    id: impact
    attributes:
      label: 影響
      description: このセキュリティ問題が及ぼす影響を説明してください。
      placeholder: |
        影響：
        - ユーザーデータの漏洩
        - システムへの不正アクセス
        - サービス拒否攻撃
        - その他の影響
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: 再現手順
      description: 問題を再現するための手順を記載してください。
      placeholder: |
        1. 特定のページにアクセス
        2. 特定の操作を実行
        3. 脆弱性を悪用
    validations:
      required: false

  - type: textarea
    id: mitigation
    attributes:
      label: 対策案
      description: 問題を解決するための対策案があれば記載してください。
      placeholder: |
        対策案：
        - 入力値の検証強化
        - 認証の強化
        - アクセス制御の改善
        - その他の対策
    validations:
      required: false

  - type: input
    id: contact
    attributes:
      label: 連絡先
      description: 追加の情報が必要な場合の連絡先を記載してください。
      placeholder: email@example.com または Discord ID
    validations:
      required: false

  - type: checkboxes
    id: checklist
    attributes:
      label: チェックリスト
      description: 以下の項目を確認してください。
      options:
        - label: この問題を公開せずに報告していることを確認しました
          required: true
        - label: 問題の詳細を第三者に共有していないことを確認しました
          required: true
        - label: 問題を悪用しようとしていないことを確認しました
          required: true
