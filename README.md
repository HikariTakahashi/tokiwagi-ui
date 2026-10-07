# Tokiwagi UI

タスク管理アプリのためのデザインシステムです。Astro は紹介用のランディングページ、Storybook はカラー・アイコン・ロゴのルール参照と実装時の確認に使います。

## VS Code の拡張機能

VS Code で `tokiwagi-ui` フォルダーを開き、拡張機能ビューで `@recommended` と検索すると、[`.vscode/extensions.json`](.vscode/extensions.json) に登録した拡張機能が表示されます。必要なものを選んでインストールしてください。開発・ビルドに必須の拡張機能はありません。

| 拡張機能 | 用途 |
| --- | --- |
| Astro (`astro-build.astro-vscode`) | `.astro` ファイルの補完・診断 |
| Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`) | Tailwind CSS v4 のクラス補完・検査 |
| MDX (`unifiedjs.vscode-mdx`) | Storybook の `.mdx` 資料の編集 |
| Bun for Visual Studio Code (`oven.bun-vscode`) | Bun のテスト表示・デバッグ |
| CSS Variables (LSP) (`miclmn451.css-variables-vscode`) | カラートークンの補完・定義への移動 |
| GitHub Pull Requests (`GitHub.vscode-pull-request-github`) | Issue・PR の確認とレビュー |

Astro と Tailwind CSS IntelliSense は特に推奨します。CSS Variables (LSP) と GitHub Pull Requests は作業内容に応じて選べます。

## 起動

Bun 1.3.9 以上を使用します。

```sh
cd tokiwagi-ui
bun install --frozen-lockfile
bun run dev:all    # Astro LP: http://localhost:4321 / Storybook: http://localhost:6006
bun run dev        # Astro LP: http://localhost:4321
bun run storybook  # Storybook: http://localhost:6006
```

`bun run dev:all` で2つのサーバーを同時に起動できます。個別に起動する場合は `dev` または `storybook` を使います。LP の Storybook リンクは Storybook サーバーを起動すると開けます。

## 管理元

- カラー値は `tokens/colors.css`、`tokens/secondary.css`、`tokens/semantic.css`、`tokens/neutrals.css` の全93トークンが定義元です。Storybook の見本・HEX・コントラスト表示はこれらを読み込みます。
- カラーの使用ルールと操作例は Storybook の「カラー」にあります。CSS を編集して保存すると開発中の表示に反映されます。
- ロゴの原本は `icons/logo/logo.svg`、使用ルールは `icons/logo/README.md` が管理元です。Storybookの「ロゴ/使用ルール」で32・64・128pxの見本、名称との併記、原本ダウンロードを確認できます。固定配色と最小32pxのルールを持つブランド資産として管理し、329種の汎用アイコン一覧とTIconの公開名生成には含めません。
- アイコンの公開名は Storybook の「アイコン/命名基準」と「アイコン/アイコン名および用途」（一覧）で管理します。各アイコンの用途・使用ルール・検索用の別名は `icons/<公開名>/README.md` が管理元です。一覧から全329アイコンの「個別ルール」へ移動できます。README と個別ページは概要・使用場面・状態の表し方・使用しない場面・表示とアクセシビリティ・関連アイコンと使い分けの6セクションです。`bell` のルールは確定済み、ほかは詳細ルール案です。既存アプリの参照 ID は「アイコン/既存フロントエンドとの対応」に保持しています。SVG 図形は各 README と同じディレクトリに329個収録済みです。一覧で検索・分類・サイズ・色を切り替え、個別ページで4サイズの見本、公開名コピー、原本SVGのダウンロードを利用できます。
- Tailwind CSS v4 の共有テーマは `tokens/tailwind.css` です。

## 検証と静的ビルド

```sh
bun test
bun run check
bun run check:react-compat
bun run build
bun run build:storybook
```

Astro の出力は `dist/`、Storybook の出力は `storybook-static/` です。Vue・React・Astro向けの `TIcon` があります。Storybookの「コンポーネント/TIcon」でReact・Vue・Astroを切り替え、選択した公開名・サイズ・色を保持して確認できます。外部公開、既存 Nuxt 画面の置き換えは未実施です。

`check:react-compat` は一時ディレクトリにReact 18.3.1と開発環境のReact 19系をそれぞれ導入し、対応する型定義で公開型・全329原本×4サイズ・SSR・ハイドレーションを検証します。依存取得にはネットワーク接続が必要です。通常の `node_modules` とロックファイルは変更せず、一時ディレクトリは終了時に削除します。

## Astroでの利用

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

Storybookの「コンポーネント/TIcon」でAstroを選ぶと、プレビュー・使用コード・API・静的出力の説明が切り替わります。React・Vueとの切り替え時も公開名・サイズ・色は維持します。

StorybookのAstro見本は `.storybook/astro-previews.ts` がBunの別プロセスで公開入口の実コンポーネントを全329種×4サイズ描画し、仮想モジュールとして供給します。生成JSONは一時ファイルへの書き込み完了後に読み込み、成功・失敗にかかわらず一時ファイルを削除します。Astro選択時にHTMLデータを読み込み、複数表示ではIDだけをインスタンスごとに分離します。色は親から継承します。Astroランタイムや別のAstroサーバーは不要で、静的Storybookにも描画結果を収録します。開発中に原本・実コンポーネントを編集すると再生成し、色CSSの変更は既存のHMRで反映します。生成結果はコミットしません。

`bun test` はAstroコンパイラと [公式Container API](https://docs.astro.build/en/reference/container-reference/) で実コンポーネントを描画し、全原本×4サイズ、並行描画のID、入力エラー、固定属性、公開入口への資料・他ランタイムの混入を検証します。

## Reactでの利用

React 18・19とViteの `?raw` 読み込みに対応する環境を対象にします。入口は `src/react/index.ts`、パッケージの公開入口は `tokiwagi-ui/react` です。npm公開・配布ビルドは未実施で、ローカルパッケージとして利用します。Reactは利用側のpeer dependencyです。React・Vueのpeerはoptionalで、選んだ入口のフレームワークを利用側に導入してください。

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

Storybookの「コンポーネント/TIcon」でReactを選ぶと、全公開名・4サイズ・トークン色の実コンポーネントを確認できます。Vueとの切り替え、複数表示、アクセシビリティ例、公開API、導入・SSRの説明も同じページにまとめています。

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

Storybookの「コンポーネント/TIcon」でVueを選ぶと、同じ確認画面と使用例をVueの実コンポーネントで確認できます。選択した名前・サイズ・色はReactとの切り替え時も保持します。

## GitHub での開発

このディレクトリは [HikariTakahashi/tokiwagi-ui](https://github.com/HikariTakahashi/tokiwagi-ui) で独立して管理します。Git と GitHub CLI (`gh`) を用意し、`gh auth login -h github.com` で認証してください。Git コマンドはこのディレクトリで実行します。

1. 作業前に [Issue](https://github.com/HikariTakahashi/tokiwagi-ui/issues) を検索します。未登録の作業は「新規実装」「不具合修正」「残タスク」から種類を選び、各テンプレートの項目に沿って Issue にします。残タスクは範囲が確定したものを追跡し、未着手の構想は必要になった時点で登録します。
2. `main` から作業ブランチを作り、関連 Issue の範囲で実装します。例: `git switch main && git pull --ff-only && git switch -c feat/123-icon-svg`。
3. 変更を確認し、該当する検証を実行してからコミット・push します。PR には関連 Issue、変更内容、検証結果、レビューで見てほしい点を記載します。Issue の完了条件をすべて満たす場合だけ `Closes #123` を使います。
4. PR 上のコメントで人間の確認内容と修正結果を記録します。確認後にマージし、Issue の状態を更新します。`main` への変更は PR 経由とし、承認必須の設定は設けません。

Issue の記載項目は `.github/ISSUE_TEMPLATE/` 内の3種類のテンプレート、PR の記載項目は `.github/PULL_REQUEST_TEMPLATE.md` にあります。Codex からは、一連の作業に `$issue-to-pr`、Issue 登録に `$github-issue`、コミット作成に `$conventional-commit`、PR 作成に `$github-pr` を指定できます。これらのリポジトリ用 skill は `.agents/skills/` にあります。

## アイコン原本の追加・差し替え

- 図形の唯一の編集元は `icons/<公開名>/<公開名>.svg` です。Downloads フォルダーには依存しません。原本は32×32の `viewBox` と制作時の座標・線幅・縦横比を保持します。
- 差し替えは同名の原本を更新します。用途・使用ルール・別名は同じディレクトリの `README.md` に記載します。新規追加時は命名基準に従い、SVG、6セクションを持つ README、README を読み込む `src/icons/<公開名>.mdx` の個別ページを一組で追加します。名前・分類・一覧は原本から、検索用の別名は README から自動的に読み込みます。件数の受け入れ条件と文書も更新してください。
- `src/lib/icon-assets.ts` が表示時に黒い線と塗りを `currentColor` に変換します。`fill="none"` とクリッピング用の白い塗りを保持し、ID参照は表示ごとに一意にします。表示用SVGを別途編集しません。
- 原本ダウンロードはStorybookの `staticDirs` で `icons/` を `/icon-assets` に配信します。README の `?raw` 読み込みと静的配信のURLを分けています。静的ビルドにも原本がそのままコピーされ、サブディレクトリへの配置でも相対URLで参照できます。
- 共通の資料用UIは `src/stories/components/IconBrowser.tsx` にあります。このコンポーネントはStorybookのMDX資料用です。アプリ向けAPIには `tokiwagi-ui/react`・`tokiwagi-ui/vue`・`tokiwagi-ui/astro` の `TIcon` を使います。
- Vue・React・Astro共通の公開名と原本へのimportは `bun run generate:icons` で `src/lib/icon-sources.ts` に生成します。Vueの既存ファイルは共通データを再exportします。新規追加・削除時に実行してください。SVG本体を複製せず、同名原本の差し替えは自動反映します。原本と生成ファイルの不一致はテストで検出します。
- `bun test`、`bun run check`、`bun run build`、`bun run build:storybook` を実行します。一覧・個別ページで原本との一致、16/20/24/32pxの判読性、トークン色、同一図柄の複数表示、キーボード操作とモバイル表示を確認してください。
- 小サイズで細部が判別しにくい図柄はサイズを上げるかラベルを併記します。全アイコンの16px利用を一律に推奨しません。詳しくはStorybookの「アイコン/共通表示ルール」を参照してください。
