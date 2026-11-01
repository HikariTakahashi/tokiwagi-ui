# THeaderの利用ルール

## 概要

ヘッダーの背景・高さ・配置を提供する部品です。React・Vue・Astroに同じ用途の公開APIを用意します。

## 使用場面

アプリの上部で、子のTHeaderSectionにposition=left・center・rightを指定し、ブランド、タイトル、操作部品を配置します。各位置は1セクションまでとし、不要な位置は省略できます。1行36pxを基準にし、幅が足りない場合は内部を横スクロールします。

## 状態の表し方

backgroundColorは既存の全93カラートークン名から指定でき、既定は`--tkw-color-neutral-0`です。例：`backgroundColor="--tkw-color-secondary-navy"`。React・Vue・Astroの公開入口からHeaderBackgroundColor型とheaderBackgroundColors一覧を利用できます。不正な値は日本語エラーで拒否します。

背景に対する文字色はneutral-900、neutral-0、neutral-1000の順に4.5:1以上となる色を選びます。THeader内のボタンは通常背景を透明にし、toneの文字色が4.5:1未満なら同様に調整します。ホバー・押下・選択・無効状態は既存の状態配色を使います。独自CSSで文字色を固定した子や、トークンの値を利用側で上書きした場合のコントラストは利用側で確認してください。

状態は含めたボタンやリンクで表現します。THeader自体はモード、日付、メニューの開閉を管理しません。

## 使用しない場面

サイドバー、ダイアログ、複数行のナビゲーションには使用しません。画面への固定配置と遷移・保存処理は利用側で扱います。

## 表示とアクセシビリティ

header要素と名前付きのスクロール領域を出力します。スクロール領域はTabでフォーカスして左右キーで移動でき、内側の操作部品もTabで移動できます。scrollLabelの既定値は「ヘッダー操作」です。子はleft→center→rightの順に記述し、DOM順とフォーカス順を維持します。中央は左右の領域を除いた空き幅の中央へ配置します。中央がなくてもrightは右端へ、中央だけなら全幅の中央へ配置します。領域に収まる名称の省略は利用側で設定します。複数配置する場合は各領域へ区別できる名前を付けてください。

## 関連コンポーネントと使い分け

[使用例を見る](../../src/stories/THeader.stories.ts)

[THeaderSection](../THeaderSection/README.md) / [THeaderButton](../THeaderButton/README.md) / [THeaderButtonGroup](../THeaderButtonGroup/README.md) / [TIcon](../TIcon/README.md)

[カラーの使用ルール](../../src/stories/colors.mdx)
