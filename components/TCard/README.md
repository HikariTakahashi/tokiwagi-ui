# TCardと構造パーツの利用ルール

## 概要

ひとつの話題に関する見出し、説明、本文、操作、画像をまとめるカードです。React・Vue・AstroからTCardと同名の構造パーツを使い、必要な部分だけ組み合わせます。

## 使用場面

プロジェクトの概要、タスクの要約、記事やメディア、導入ガイドへの入口などに使います。TCardHeaderに見出し・説明、TCardBodyに本文、TCardFooterに補足や操作を置きます。画像・動画はTCardMediaへ渡し、カードの端まで表示できます。幅・高さ・一覧の列数は利用側で指定します。

## 状態の表し方

variantはoutline（枠線、既定）・elevated（枠線なし）・subtle（淡い背景）です。すべてにTButtonと同じ右2px・下2px・ぼかし4px・黒25%の影を表示します。sizeはsm・md（既定）・lgで、内側余白12・16・24pxと部分間の間隔8・12・16pxを切り替えます。角丸は12pxです。カラー・書体は既存トークンを参照します。

完了・選択・保存などの状態は利用側が管理し、文言やチェックボックス・ラジオボタンなどで伝えます。読み込み中はaria-busyと読み込み表示を組み合わせます。カード自体にselected・disabled・loadingや独自のクリック操作は追加しません。

## 使用しない場面

単なるページ全体の囲みや、複数の無関係な話題の集約には使いません。表形式の比較や連続した一覧には表やリストを使います。操作実行だけの用途はTButton、本文中の画面遷移はTLink、ボタン型の遷移はTLinkButtonを使います。

## 表示とアクセシビリティ

TCardのasはdiv（既定）・article・sectionです。TCardTitleのasはh1〜h6（既定h3）で、利用側がページの見出し階層に合わせます。カードの読み上げ名が必要なら、利用側で一意なタイトルIDとaria-labelledbyを指定します。TCardHeader・TCardBody・TCardFooter・TCardMediaはdiv、TCardDescriptionはpで、不要なランドマークを増やしません。標準属性・class・style・children／slotとReact・Vueのネイティブイベントを対応する要素へ転送します。

TCardActionAreaはhref必須のa要素です。カード全体または主操作の領域をリンクにでき、TabとEnterで操作できます。リンク内には別のリンク、ボタン、入力欄などを入れません。複数の操作がある場合は全体リンクを使わず、本文やフッターに独立した操作要素を置きます。targetが_blankのときはrelからopenerを除きnoopenerを補います。URLの決定・検証、ルーター連携、現在地判定は利用側が担います。disabledは提供しません。

画像のalt、動画の代替情報、アイコンだけの操作の読み上げ名は利用側が指定します。装飾アイコンには公開TIconを使います。色だけで状態を伝えず、フォーカス輪郭を隠さないでください。Astroは静的HTMLで、追加操作は利用側のscriptやフォームで接続します。

## 関連コンポーネントと使い分け

[使用例を見る](../../src/stories/TCard.stories.ts)

[TButton](../TButton/README.md)は操作実行、[TLink](../TLink/README.md)は本文の遷移、[TLinkButton](../TLinkButton/README.md)はボタン型の遷移、[TText](../TText/README.md)は本文の書式を担います。[カラーの使用ルール](../../src/stories/colors.mdx)も参照してください。
