# TLinkの利用ルール

## 概要

本文や補助導線で画面遷移に使う、下線付きのa要素です。React・Vue・Astroの同名APIで提供します。文字の書式は周囲から継承し、任意の前後アイコンを添えられます。

## 使用場面

アプリ内の別画面、外部ページ、ページ内の詳細への移動に使います。hrefは必須で、相対URL・絶対URL・フラグメントなどを指定できます。未指定・空文字・空白のみは日本語エラーになります。

## 状態の表し方

toneはneutralと7色のプライマリーから選び、既定はneutralです。文字とアイコンに既存の濃い前景トークンを使います。ホバー・押下中は下線を太くし、キーボードフォーカスは輪郭で示します。現在地は利用側で判定してaria-currentを指定し、太字と太い下線で示します。未指定・falseでは現在地を強調しません。

## 使用しない場面

保存・削除・表示切り替えなどの操作にはTButton、ヘッダー内の移動にはTHeaderLinkを使います。disabledは提供しません。遷移できない項目は、利用側で理由を添えたテキストなどとして表示してください。URLの決定・入力値の検証・ルーターとの連携・現在地の自動判定は利用側が担います。

## 表示とアクセシビリティ

Reactのchildren、Vue・Astroの既定スロットに「予定の詳細を見る」など遷移先が分かる文字を入れます。ボタンやリンクを入れ子にしないでください。leadingIconとtrailingIconは16pxの装飾で、既定では表示しません。画面遷移にはarrow-top-right、対象の案内にはcalendarなどを選べます。アイコンだけのリンクには、親のTLinkにaria-labelなどで読み上げ名を指定してください。

Tabでフォーカスし、Enterで遷移します。修飾キー・中央クリック・右クリックなど標準のリンク操作を維持します。Spaceを独自にクリックへ変換しません。行内の文字は折り返せます。タッチ操作の密集する領域では利用側が間隔を確保してください。

target・rel・download・class・data属性・aria属性を転送します。target=_blankではrelからopenerを除き、他の値を保持してnoopenerを補完します。noreferrerは自動追加しません。外部サイト・別タブへの移動は必要に応じて文言でも伝えます。React・Vueはネイティブイベントを転送し、Astroは利用側scriptで接続します。

## 関連コンポーネントと使い分け

[TLinkButton](../TLinkButton/README.md)

[使用例を見る](../../src/stories/TLink.stories.ts)

[TButton](../TButton/README.md) / [THeaderLink](../THeaderLink/README.md) / [TIcon](../TIcon/README.md) / [TText](../TText/README.md) / [カラーの使用ルール](../../src/stories/colors.mdx)
