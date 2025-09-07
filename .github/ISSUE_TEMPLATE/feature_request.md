---
name: ✨ 機能リクエスト
description: 新機能や改善の提案
title: "[FEATURE] "
labels: ["enhancement", "feature-request"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## ✨ 機能リクエスト

        新機能や改善のご提案、ありがとうございます！あなたのアイデアがAI学習サポートアプリをより良くするかもしれません。

  - type: textarea
    id: summary
    attributes:
      label: 要約
      description: 提案する機能の概要を簡潔に説明してください。
      placeholder: 例）ダークモードの追加
    validations:
      required: true

  - type: textarea
    id: problem
    attributes:
      label: 解決したい問題
      description: この機能が必要な理由や、解決したい問題を説明してください。
      placeholder: |
        現在の問題：
        - 長時間の使用で目が疲れる
        - 夜間の使用時に画面が明るすぎる

        この機能で解決できること：
        - 目の負担を軽減
        - ユーザビリティの向上
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: 提案する解決策
      description: どのように問題を解決するかを具体的に説明してください。
      placeholder: |
        実装案：
        1. システム設定に連動した自動ダークモード
        2. 手動切り替えボタンの追加
        3. テーマカラーのカスタマイズ機能
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: 代替案
      description: 他に考えられる解決方法があれば記載してください。
      placeholder: 例）ライトモードの色調を柔らかくする、コントラストを下げる
    validations:
      required: false

  - type: dropdown
    id: priority
    attributes:
      label: 優先度
      description: この機能の実装優先度を評価してください。
      options:
        - 高 (High) - 多くのユーザーに影響し、すぐに実装すべき
        - 中 (Medium) - 便利だが、すぐに実装する必要はない
        - 低 (Low) - あったら便利だが、優先度は低い
        - アイデア (Idea) - 将来的に検討するアイデア
    validations:
      required: true

  - type: dropdown
    id: complexity
    attributes:
      label: 実装難易度（推定）
      description: この機能の実装難易度を評価してください。
      options:
        - 低 (Low) - 既存の技術で簡単に実装可能
        - 中 (Medium) - ある程度の開発が必要
        - 高 (High) - 大規模な開発や新技術の導入が必要
        - 不明 (Unknown) - 実装難易度が不明
    validations:
      required: true

  - type: textarea
    id: additional-context
    attributes:
      label: 追加情報
      description: 機能に関連する追加情報があれば記載してください。
      placeholder: |
        - 参考画像やデザイン
        - 類似機能のある他のアプリ
        - 技術的な制約や考慮点
        - 想定されるユーザーのフィードバック

  - type: checkboxes
    id: checklist
    attributes:
      label: チェックリスト
      description: 以下の項目を確認してください。
      options:
        - label: 同様の機能リクエストが既に存在しないことを確認しました
          required: true
        - label: この機能がプロジェクトの目標に合致することを確認しました
          required: true
        - label: 個人情報や機密情報が含まれていないことを確認しました
          required: true
