# コンポーネントの使い方

本ページの利用例はMIT対象のTIconです。[ライセンス適用範囲](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/LICENSE-SCOPE.md)を確認してください。`TLogo`・`TBrand` は同じ入口からexportされていますがMIT対象外です。既存の詳細・利用例は[ブランド参照資料](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/docs/brand-reference.md)に保存しています。

## 導入方法と対象環境

### 共通フォント

標準フォントはSan Franciscoです。`tokiwagi-ui/tokens/typography.css`を読み込み、ルートに`font-family: var(--tkw-font-family-sans)`、入力欄・ボタンに`font-family: inherit`を指定します。コードには`var(--tkw-font-family-mono)`を使います。Tailwind CSS v4の共有テーマにも含まれ、`font-sans`・`font-mono`で利用できます。日本語・Apple以外のOSはシステム書体へフォールバックし、フォント本体の同梱・配信は行いません。詳細は[フォントの使用ルール](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/docs/typography.md)とStorybookの「フォント/使用ルール」を参照してください。

### ローカル導入

npmレジストリへの公開・配布ビルドは未実施です。下記はGitから取得した `tokiwagi-ui` を、隣接するアプリへローカル導入する方法です。`private: true` を維持しています。

```text
workspace/
├── tokiwagi-ui/
└── your-app/      # 下記コマンドはこのアプリ側で実行
```

```sh
bun add ../tokiwagi-ui
# npmを使う利用側では npm install ../tokiwagi-ui
```

`icons/`・`src/`・`tokens/` を含むソース一式が必要です。生成済みJavaScriptのみを配るパッケージではなく、Viteの `?raw` 読み込み、TypeScript、および利用するフレームワークに対応したビルド環境が必要です。ローカル導入で含まれるブランド関連ファイルの権利はMITへ変わりません。

## カラートークンとTailwind

必要なトークンのCSSをアプリ全体で一度読み込みます。`colors.css`（42）、`secondary.css`（18）、`semantic.css`（24）、`neutrals.css`（9）の計93トークンが定義元です。HEXを利用側や文書へ複製せず、CSSカスタムプロパティを参照してください。

Tailwind CSS v4の利用側では、既存のTailwindエントリに `@import "tokiwagi-ui/tokens/tailwind.css";` を追加して共有テーマを読み込めます。`@theme inline` は既存トークンを参照します。このテーマ自体はPreflightを読み込みません。

## Astroでの利用

TIconの図柄・サイズ・色の選び方と、親要素が担う意味・操作のルールは、[TIconの利用ルール](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TIcon/README.md)を参照してください。React・Vueでも同じルールに従います。

Astroの入口は `src/astro/index.ts`、パッケージの公開入口は `tokiwagi-ui/astro` です。このリポジトリのAstro 7.3.4で検証しています。npm公開・配布ビルドは未実施で、`bun add ../tokiwagi-ui`（npmの場合 `npm install ../tokiwagi-ui`）でローカルパッケージとして取り込みます。`icons/`・`src/`・`tokens/`を含むリポジトリ全体を参照してください。Astro/Viteの `.astro` と `?raw` 読み込みを使用し、React・Vueの導入は不要です。

```astro
---
import { TIcon, isIconName, type IconName } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';
const fromApi: string = 'calendar';
const safeName: IconName = isIconName(fromApi) ? fromApi : 'help';
---
<button type="button" aria-label="通知一覧を開く" class="notification-button">
  <TIcon name="bell" size={24} class="notification-icon" />
</button>
<a href="/tasks"><TIcon name="task" size={20} /> タスク一覧</a>
<span><TIcon name={safeName} color="var(--tkw-color-primary-blue-on-subtle)" /> カレンダー</span>
<span><TIcon name="check" size={20} /> 完了</span>
```

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `name` | `IconName`（必須） | 全329個の公開名から選ぶ |
| `size` | `IconSize = 16 \| 20 \| 24 \| 32`、既定24 | 正方形の表示サイズ |
| `color` | `string`、既定 `currentColor` | 親の文字色を継承。明示指定は既存トークンを参照 |
| `class` | `string` | SVGのクラス名 |

`TIconProps`、`IconName`、`IconSize`、`iconNames`、`isIconName` を同じ入口からexportします。名前の誤記と非対応サイズは型検査で検出し、型を迂回した場合も日本語エラーを投げます。外部文字列は `isIconName()` で検証し、代替名は利用側で選びます。

React・Vue版と同じ装飾用APIです。SVGの `aria-hidden="true"`・`focusable="false"`・32×32のviewBox・width/heightを固定し、追加のSVG属性（id、role、aria-label、styleなど）・イベント・slotは転送しません。意味のある状態・情報は読み上げ可能なテキストを併記します。アイコンだけのリンクやボタンには親に目的が分かる名前を付けます。フォーカス、ホバー、押下、無効状態、操作領域は親が担い、クラスで形状・線幅・サイズを上書きしません。

黒い線と塗りだけをcurrentColor化し、原本の座標・線幅・縦横比・透明な塗り・白いクリッピングを維持します。クリッピングIDはビルド／サーバー描画時に `crypto.randomUUID()` でインスタンスごとに生成し、出力HTMLに保存します。ハイドレーションやクライアントランタイムは不要で、ビルドごとにID文字列は変わります。アプリ向け入口はREADME全文、Storybook専用コード、React・Vueランタイムを読み込みません。

Storybookの「コンポーネント/TIcon」でAstroを選ぶと、実コンポーネントが生成した静的HTMLを表示します。React・Vueとの切り替え時も公開名・サイズ・色は維持します。

StorybookのAstro見本は `.storybook/astro-previews.ts` がBunの別プロセスで公開入口の実コンポーネントを全329種×4サイズ描画し、仮想モジュールとして供給します。生成JSONは一時ファイルへの書き込み完了後に読み込み、成功・失敗にかかわらず一時ファイルを削除します。Astro選択時にHTMLデータを読み込み、複数表示ではIDだけをインスタンスごとに分離します。色は親から継承します。Astroランタイムや別のAstroサーバーは不要で、静的Storybookにも描画結果を収録します。開発中に原本・実コンポーネントを編集すると再生成し、色CSSの変更は既存のHMRで反映します。生成結果はコミットしません。

`bun test` はAstroコンパイラと [公式Container API](https://docs.astro.build/en/reference/container-reference/) で実コンポーネントを描画し、全原本×4サイズ、並行描画のID、入力エラー、固定属性、公開入口への資料・他ランタイムの混入を検証します。


## Reactでの利用

React `^18.0.0 || ^19.0.0` とViteの `?raw` 読み込みに対応する環境を対象にします。各系列の下限はReact・React DOM 18.0.0と19.0.0です。対応する型定義と、公開型・SSR・DOMハイドレーション・props更新の検証結果は[テスト方法](Testing#react互換性の検証結果)を参照してください。入口は `src/react/index.ts`、パッケージの公開入口は `tokiwagi-ui/react` です。npm公開・配布ビルドは未実施で、ローカルパッケージとして利用します。Reactは利用側のpeer dependencyです。React・Vueのpeerはoptionalで、選んだ入口のフレームワークを利用側に導入してください。

同じワークスペースのReactプロジェクトなら `bun add ../tokiwagi-ui`（npmの場合 `npm install ../tokiwagi-ui`）で取り込めます。`icons/`・`src/`・`tokens/`を含むリポジトリ全体を参照してください。Reactの重複ロードを避けるため、Viteに `resolve: { dedupe: ['react', 'react-dom'] }` を設定します。アプリのReactとReact DOMは対応する同じバージョンを使います。

```tsx
import { TIcon, isIconName, type IconName } from 'tokiwagi-ui/react';
// アプリ全体で一度読み込む。色値の定義元はtokens/だけ。
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';

const fromApi: string = 'calendar';
const safeName: IconName = isIconName(fromApi) ? fromApi : 'help';

export function Actions() {
  return <>
    <button type="button" aria-label="通知一覧を開く" className="notification-button">
      <TIcon name="bell" size={24} className="notification-icon" />
    </button>
    <button type="button"><TIcon name="plus" size={20} /> タスクを追加</button>
    <span>
      <TIcon name={safeName} color="var(--tkw-color-primary-blue-on-subtle)" /> カレンダー
    </span>
  </>;
}
```

```css
.notification-button {
  color: var(--tkw-color-primary-blue-on);
  background: var(--tkw-color-primary-blue);
  min-width: 44px;
  min-height: 44px;
}
.notification-button:hover { background: var(--tkw-color-primary-blue-hover); }
.notification-button:active { background: var(--tkw-color-primary-blue-active); }
.notification-button:focus-visible {
  outline: 3px solid var(--tkw-color-primary-blue-on-subtle);
  outline-offset: 3px;
}
```

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `name` | `IconName`（必須） | 全329個の公開名から選ぶ |
| `size` | `IconSize = 16 \| 20 \| 24 \| 32`、既定24 | 正方形の表示サイズ |
| `color` | `string`、既定 `currentColor` | 親の文字色を継承。明示指定は既存トークンを参照 |
| `className` | `string` | React形式のクラス名をSVGに適用 |

`TIconProps`、`IconName`、`IconSize`、`iconNames`、`isIconName` を同じ入口からexportします。公開名の誤記と非対応サイズは型検査で検出し、型を迂回した場合も日本語エラーを投げます。外部文字列は `isIconName()` で検証し、代替名は利用側で選びます。アプリ向け入口はREADME本文、Storybook専用コード、Vueランタイムを読み込みません。

`TIcon` はVue版と同じ装飾用APIです。SVGの `aria-hidden="true"`、`focusable="false"`、viewBox、サイズを固定し、追加属性・イベント・children・refは転送しません。アイコンだけの操作には親のbutton/linkに操作名を付け、状態・情報には読み上げ可能なテキストを併記します。フォーカス、ホバー、押下、無効状態、操作領域は親が担います。クラスでviewBox・線幅・縦横比・サイズを上書きしないでください。

黒い線と塗りだけを `currentColor` に変換し、原本の形状・透明な塗り・白いクリッピングを維持します。クリッピングIDはReactの `useId()` でインスタンスごとに分離します。SSRとクライアントでは同じコンポーネントツリーを描画してください。

同じ文書に複数React rootを置く場合は、それぞれ異なる `identifierPrefix` を指定し、SSR側とクライアント側で同じ値を使います。単一rootでは追加設定は不要です（[React公式のuseId仕様](https://react.dev/reference/react/useId)）。

```tsx
// サーバー側：htmlをsidebar-root要素の内側に出力する。
import { renderToString } from 'react-dom/server';
import { TIcon } from 'tokiwagi-ui/react';
const html = renderToString(<TIcon name="moon" />, { identifierPrefix: 'sidebar-' });
```

```tsx
// クライアント側：サーバーと同じツリー・接頭辞を使用する。
import { hydrateRoot } from 'react-dom/client';
import { TIcon } from 'tokiwagi-ui/react';
hydrateRoot(document.getElementById('sidebar-root')!, <TIcon name="moon" />, {
  identifierPrefix: 'sidebar-',
});
```

クライアント描画だけの場合は `createRoot(element, { identifierPrefix: 'sidebar-' })` を使います。別rootには別の接頭辞を指定します。

Storybookの「コンポーネント/TIcon」でReactを選ぶと、全公開名・4サイズ・トークン色の実コンポーネントを確認できます。方式の切り替えはStorybookで、公開API・導入・SSR・アクセシビリティの説明は本ページで確認します。


## Vueでの利用

Vue 3.5以上とViteの `?raw` 読み込みに対応した環境（Nuxt/Vueなど）を対象にします。入口は `src/vue/index.ts`、パッケージの公開入口は `tokiwagi-ui/vue` です。npmへの公開・配布ビルドは未実施で、ローカルパッケージとして利用します。Vueは利用側のpeer dependencyです。

同じワークスペースのNuxt/Vueプロジェクトなら `bun add ../tokiwagi-ui`（npmの場合 `npm install ../tokiwagi-ui`）で取り込めます。`icons/`・`src/`・`tokens/`を含むリポジトリ全体を参照してください。別のVueをロードしないよう、Viteの `resolve.dedupe: ['vue']` を指定します。Nuxtでは `vite: { resolve: { dedupe: ['vue'] } }` です。

```vue
<script setup lang="ts">
import { TIcon, isIconName, type IconName } from 'tokiwagi-ui/vue';
// アプリ全体で一度読み込む。色値の定義元はtokens/だけ。
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';

const notificationIcon: IconName = 'bell';
const fromApi: string = 'calendar';
const safeName: IconName = isIconName(fromApi) ? fromApi : 'help';
</script>

<template>
  <button type="button" aria-label="通知一覧を開く" class="notification-button">
    <TIcon :name="notificationIcon" :size="24" class="notification-icon" />
  </button>
  <button type="button">
    <TIcon name="plus" :size="20" /> タスクを追加
  </button>
  <span>
    <TIcon :name="safeName" color="var(--tkw-color-primary-blue-on-subtle)" /> カレンダー
  </span>
</template>

<style scoped>
.notification-button {
  color: var(--tkw-color-primary-blue-on);
  background: var(--tkw-color-primary-blue);
  min-width: 44px;
  min-height: 44px;
}
.notification-button:hover { background: var(--tkw-color-primary-blue-hover); }
.notification-button:active { background: var(--tkw-color-primary-blue-active); }
.notification-button:focus-visible {
  outline: 3px solid var(--tkw-color-primary-blue-on-subtle);
  outline-offset: 3px;
}
</style>
```

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `name` | `IconName`（必須） | 全329個の公開名から選ぶ |
| `size` | `IconSize = 16 \| 20 \| 24 \| 32`、既定24 | 正方形の表示サイズ。Vueテンプレートでは `:size="20"` のように数値で渡す |
| `color` | `string`、既定 `currentColor` | 親の文字色を継承。明示指定は `var(--tkw-color-…)` を使う |
| `class` | Vueの `HTMLAttributes['class']` | 文字列・配列・オブジェクトをSVGに適用 |

`TIconProps`、`IconName`、`IconSize`、`iconNames`、`isIconName` を同じ入口からexportします。公開名の誤記と非対応サイズは型検査で検出します。JavaScriptや外部データが型を迂回した場合も日本語エラーを投げ、別の図柄へ暗黙に置き換えません。外部文字列は `isIconName()` で検証し、必要な代替名は利用側で選びます。

`TIcon` は装飾用です。`aria-hidden="true"` と `focusable="false"` を固定し、SVG自体にクリックやフォーカスを設けません。公開props以外の属性・イベント・slotは転送しません。アイコンだけの操作には親のbutton/linkに操作内容の読み上げ名を付け、状態や情報には読み上げ可能な文言を併記します。クラスでviewBox・線幅・縦横比・サイズを上書きしないでください。小さい図柄が判別しにくければサイズを上げます。

クリッピングIDはVueの `useId()` でインスタンスごとに分離し、SSRとハイドレーションで安定させます。同じHTML文書に複数のVueアプリを置く場合は、それぞれ `app.config.idPrefix` を別の値に設定し、SSR側・クライアント側では同じ値を使ってください（[Vue公式のuseId仕様](https://vuejs.org/api/composition-api-helpers.html#useid)）。通常の単一Nuxtアプリでは追加設定は不要です。

Storybookの「コンポーネント/TIcon」でVueを選ぶと、Vueの実コンポーネントの表示を確認できます。選択した名前・サイズ・色はReactとの切り替え時も保持します。


## 管理元

- コンポーネントの利用ルールは [TBrand](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TBrand/README.md)・[TIcon](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TIcon/README.md)・[TLogo](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TLogo/README.md) の個別READMEが管理元です。Storybookの「コンポーネント/個別ルール」はこれらを読み込む表示用ページで、最小プレビューとは分けて参照できます。MIT対象の公開API・利用コード・導入説明は本ページ、ブランドの詳細は[ブランド参照資料](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/docs/brand-reference.md)に保持します。
- カラー値は `tokens/colors.css`、`tokens/secondary.css`、`tokens/semantic.css`、`tokens/neutrals.css` の全93トークンが定義元です。Storybook の見本・HEX・コントラスト表示はこれらを読み込みます。
- カラーの使用ルールと操作例は Storybook の「カラー」にあります。CSS を編集して保存すると開発中の表示に反映されます。
- ロゴの原本は `icons/logo/logo.svg`、使用ルールは `icons/logo/README.md` が管理元です。Storybookの「ロゴ/使用ルール」で32・64・128pxの見本、名称との併記、原本ダウンロードを確認できます。固定配色と最小32pxのルールを持つブランド資産として管理し、329種の汎用アイコン一覧とTIconの公開名生成には含めません。
- アイコンの公開名は Storybook の「アイコン/命名基準」と「アイコン/アイコン名および用途」（一覧）で管理します。各アイコンの用途・使用ルール・検索用の別名は `icons/<公開名>/README.md` が管理元です。一覧から全329アイコンの「個別ルール」へ移動できます。README と個別ページは概要・使用場面・状態の表し方・使用しない場面・表示とアクセシビリティ・関連アイコンと使い分けの6セクションです。`bell` のルールは確定済み、ほかは詳細ルール案です。既存アプリの参照 ID は「アイコン/既存フロントエンドとの対応」に保持しています。SVG 図形は各 README と同じディレクトリに329個収録済みです。一覧で検索・分類・サイズ・色を切り替え、「アイコン/使用例」の全329ストーリーではReact版の公開TIconを1つ中央に表示します。公開名は固定し、初期値は24px・currentColorです。Controlsで16・20・24・32pxと、継承・ニュートラル・7色のプライマリーを切り替え、選択をURLに保持します。Actions・Interactionsは標準パネルとして表示します。各個別ルールから対応する使用例に移動できます。
- Tailwind CSS v4 の共有テーマは `tokens/tailwind.css` です。
