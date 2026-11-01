# THeaderLinkの利用ルール

## 概要

ヘッダー内の画面遷移に使う、高さ36pxのa要素です。THeaderButtonと外観を共有し、テキストと任意の装飾アイコンを組み合わせます。React・Vue・Astroの公開入口から利用できます。

## 使用場面

アプリ内の画面遷移、外部ページへの移動、ページ内リンクに使います。hrefは必須で、相対URL・絶対URL・フラグメントを指定できます。未指定・空文字・空白のみは日本語エラーになります。

## 状態の表し方

toneはneutralと7色のプライマリーで既定neutralです。hover・押下・focus-visible・現在地を表現します。現在地は利用側で判定し、aria-currentにpage・locationなどを指定します。有効な現在地指定では背景と下線を表示し、未指定・falseでは表示しません。selected・disabledは提供しません。

active（boolean、既定false）をtrueにすると背景と下線を表示します。マウス・タッチなどで押している間（CSSの:active）も下線を表示し、離すと元の状態へ戻ります。activeはクリックで自動変更しません。aria-currentは変更しないため、現在のページを表す場合はaria-currentも指定してください。

THeader内では通常時の背景を透明にし、既存の文字色調整で背景と4.5:1以上のコントラストを確保します。状態表示は既存の背景・前景の組を使います。単独配置では通常時の白背景とtoneの前景色を使います。

## 使用しない場面

メニューを開く、表示を切り替える、保存するなどの操作にはTHeaderButtonを使います。遷移できない項目は利用側で非表示または操作できないテキストとして表示してください。ルーター連携や現在URLからの自動判定は内包しません。

## 表示とアクセシビリティ

iconOnlyは既定falseです。アイコンのみではiconOnlyを指定し、aria-labelまたはaria-labelledbyでリンク先が分かる名前を与えてください。Tabでフォーカスし、Enterで遷移します。修飾キー・中央クリック・右クリックによるネイティブのリンク操作を維持し、Spaceを独自にクリックへ変換しません。

target・rel・ネイティブ属性・class・data属性・aria属性を転送します。targetが_blankの場合はrelのopenerを除き、他の値を保持してnoopenerを補完します。noreferrerは自動追加しません。React・Vueはネイティブイベントを転送し、Astroは利用側scriptで接続します。操作領域は36×36px以上です。THeaderButtonGroup内ではボタンとリンクを直接の子として混在できます。

## 関連コンポーネントと使い分け

[使用例を見る](../../src/stories/THeaderLink.stories.ts)

[THeader](../THeader/README.md) / [THeaderSection](../THeaderSection/README.md) / [THeaderButton](../THeaderButton/README.md) / [THeaderButtonGroup](../THeaderButtonGroup/README.md) / [TIcon](../TIcon/README.md)

[カラーの使用ルール](../../src/stories/colors.mdx)
