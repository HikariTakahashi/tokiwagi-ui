# THeaderSectionの利用ルール

## 概要

THeader直下で左・中央・右の領域を表すdiv要素です。配置と内容の入れ物を担い、操作や選択状態は管理しません。

## 使用場面

positionにleft・center・rightを指定し、ブランド、タイトル、THeaderButtonなどをまとめます。positionは必須です。各位置は1つまでとし、不要な領域は省略できます。

## 状態の表し方

セクション自体は選択・無効などの操作状態を持ちません。子のボタンやテキストで状態を表します。独自の固定幅・余白・背景は追加しません。

## 使用しない場面

THeaderの外や、汎用のページレイアウト・複数行のナビゲーションには使用しません。同じ位置の内容は1つのセクションにまとめます。

## 表示とアクセシビリティ

left→center→rightの順に記述してください。CSSでDOM順を並べ替えず、Tabの移動順を保ちます。左右は内容幅を取り、中央は残りの幅の中央へ内容を揃えます。中央がない場合も右側は右端へ配置し、中央だけの場合は全幅の中央へ配置します。高さ36pxの1行を維持し、収まらない場合は親THeaderの内部を横スクロールします。セクション自体にフォーカスは付けません。操作名・フォーカスは子のbutton/linkが担います。

## 関連コンポーネントと使い分け

[使用例を見る](../../src/stories/THeaderSection.stories.ts)

[THeader](../THeader/README.md) / [THeaderButton](../THeaderButton/README.md) / [THeaderButtonGroup](../THeaderButtonGroup/README.md)

[カラーの使用ルール](../../src/stories/colors.mdx)
