# THeaderButtonGroupの利用ルール

## 概要

ヘッダー内で複数のTHeaderButtonを横並びに連結する、状態を持たないグループです。

## 使用場面

年・月・週や、前へ・今日・次へなど、一連の操作をまとめる場合に使います。各ボタンを直接の子に配置します。

## 状態の表し方

グループは選択値や無効状態を管理しません。各THeaderButtonへselected・disabledを個別に渡します。

## 使用しない場面

タブやラジオグループの代わりには使いません。キーボードの矢印移動や単一選択の制御は実装しません。

## 表示とアクセシビリティ

role=groupを出力します。aria-labelまたはaria-labelledbyで目的が分かるグループ名を指定してください。各操作はTabで移動でき、ボタンのネイティブ操作を維持します。

## 関連コンポーネントと使い分け

[使用例を見る](../../src/stories/THeaderButtonGroup.stories.ts)

[THeader](../THeader/README.md) / [THeaderSection](../THeaderSection/README.md) / [THeaderButton](../THeaderButton/README.md) / [TIcon](../TIcon/README.md)

[カラーの使用ルール](../../src/stories/colors.mdx)
