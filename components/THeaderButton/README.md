# THeaderButtonの利用ルール

## 概要

ヘッダー内の操作に共通する、高さ36pxのbutton要素です。テキストと任意の装飾アイコンを組み合わせます。

## 使用場面

メニューのトリガー、表示形式の切替、前後移動などに使います。クリック後の処理は利用側から接続します。

## 状態の表し方

toneはneutralと7色のプライマリーで既定neutralです。hover・押下・focus-visible・disabled・selectedを表現します。selectedを指定するとaria-pressedが付き、trueでは下線も表示します。未指定ではトグルの意味を付けません。選択値はクリックで自動変更せず、利用側から更新します。

## 使用しない場面

画面遷移にはa要素を使ってください。メニュー、ダイアログ、日付選択、日付計算や保存処理は内包しません。

## 表示とアクセシビリティ

既定typeはbuttonです。アイコンのみではiconOnlyを指定し、aria-labelまたはaria-labelledbyで操作名を与えてください。メニュートリガーには利用側からaria-expanded・aria-controlsを設定します。通常のボタン操作であるTab・Enter・Spaceを使い、disabled時は実際のbutton要素を無効にします。操作領域は36×36px以上で、44px以上のタッチ領域が必要な画面では利用側で別の配置を検討します。

## 関連コンポーネントと使い分け

[使用例を見る](../../src/stories/THeaderButton.stories.ts)

[THeader](../THeader/README.md) / [THeaderSection](../THeaderSection/README.md) / [THeaderButtonGroup](../THeaderButtonGroup/README.md) / [TIcon](../TIcon/README.md)

[カラーの使用ルール](../../src/stories/colors.mdx)
