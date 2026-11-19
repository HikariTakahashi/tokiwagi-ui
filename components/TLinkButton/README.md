# TLinkButtonの利用ルール

## 概要

画面遷移をボタンの見た目で表示するReact・Vue・Astro共通のa要素です。TButtonの共通CSSで色・寸法・影を揃え、角丸は現在の12pxにします。

## 使用場面

「カレンダーを開く」など、本文のリンクより目立たせたい遷移の入口に使います。hrefは必須で、相対URL・絶対URL・フラグメントなどを指定できます。未指定・空文字・空白のみは日本語エラーです。

## 状態の表し方

toneはneutralと7色のプライマリーで、既定neutralです。通常・ホバー・押下の背景にTButtonと同じ既存トークンを使い、プライマリー色では白い文字とアイコンを表示します。現在地は利用側で判定してaria-currentを指定し、文字ラベルの下線で示します。未指定・falseでは現在地の下線を表示しません。`disabled`（既定false）で遷移を無効にできます。TButtonと同じニュートラルの無効色・影なし・操作不可カーソルにし、ホバー・押下の配色を抑止します。キーボードフォーカスは輪郭で示します。

## 使用しない場面

保存や削除などの操作にはTButton、本文に続く通常のリンクにはTLink、ヘッダー内の遷移にはTHeaderLinkを使います。無効にする場合はdisabledを指定し、必要に応じて利用側で理由を伝えます。URLの検証と決定・ルーター連携・現在地の自動判定は利用側が担います。

## 表示とアクセシビリティ

Reactのchildren、Vue・Astroの既定スロットに遷移先が分かる文字を入れます。リンクやボタンを入れ子にしないでください。leadingIcon・trailingIconはsizeに連動する装飾TIconで、既定では表示しません。sizeはsm・md・lg（既定）で、文字は1.25・1.5・1.75rem、アイコンは20・24・32px、最小高さは40・44・50px、左右paddingは12・14・16px、gapは6・8・10pxです。角丸は現在の12px、文字の太さは700、縦paddingは6pxを維持します。長い文言は折り返して高さが伸びます。幅は利用側のclass（ReactはclassName）などで指定します。

有効時はTabでフォーカスし、Enterで遷移します。Spaceを独自にクリックへ変換せず、修飾キー・中央クリック・右クリックなど標準のリンク操作を維持します。target・rel・download・class・data属性・aria属性を転送します。target=_blankではrelからopenerを除き、他の値を維持してnoopenerを補完します。noreferrerは自動追加しません。別タブや外部サイトへの遷移は必要に応じて文言でも伝えます。React・Vueはネイティブイベントを転送し、Astroは利用側scriptで接続します。

disabled=trueではhref・target・rel・download・pingなどのリンク属性、tabindex・autofocus・accesskey・contenteditable、渡されたクリック・キー・ポインター操作のハンドラーを出力しません。role=link・aria-disabled=trueで無効なリンクと伝え、Tab移動の対象から外します。hrefは無効時もpropsとして必須で、有効に戻すと元の属性・イベントを復元します。React・Vueではクリック・中央クリック・ダブルクリック・起動キーの伝播も抑止します。AstroはJavaScriptなしで遷移しない静的HTMLを出力します。利用側で後付けするイベントやルーターの委譲処理はaria-disabledを確認してください。

プライマリーと白い文字の配色にはTButtonと同じ既知のコントラスト制約があります。特にイエローは通常・ホバーの大きな文字の3:1、押下の通常サイズの文字の4.5:1に不足します。使用先ではカラーの使用ルールを確認してください。

## 関連コンポーネントと使い分け

[使用例を見る](../../src/stories/TLinkButton.stories.ts)

[TButton](../TButton/README.md) / [TLink](../TLink/README.md) / [THeaderLink](../THeaderLink/README.md) / [TIcon](../TIcon/README.md) / [カラーの使用ルール](../../src/stories/colors.mdx)
