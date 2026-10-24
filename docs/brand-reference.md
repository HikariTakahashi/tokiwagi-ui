# ブランド部品の参照資料（MIT対象外）

ロゴ・TLogo・TBrandは公開リポジトリに掲載を続けますが、[MITの適用範囲](../LICENSE-SCOPE.md)から除外しています。本資料と以下の既存コード例は参照用に保存したもので、ブランド資産・専用コードの利用許諾ではありません。利用を希望する場合は権利者Hikari Takahashiへ別途確認してください。連絡は[GitHubプロフィール](https://github.com/HikariTakahashi)を参照してください。

以下は従来READMEの説明を移設したものです。[MIT対象の導入方法](../README.md)とは区別してください。

## TLogoの利用

利用場面・固定配色・余白・名称併記と読み上げの詳細は、[TLogoの利用ルール](../components/TLogo/README.md)を参照してください。

ブランドロゴは `TLogo` としてReact・Vue・Astroの各公開入口から利用できます。固定配色の原本を画像として表示し、TIconの公開名には含めません。Storybookの「コンポーネント/TLogo」で3方式の実コンポーネントを中央に1つ表示し、Controlsでサイズと読み上げ状態を切り替えられます。公開APIと利用例は本資料で説明します。

| props | 既定値 | 用途 |
| --- | --- | --- |
| `size` | `32` | 図形の幅。32・64・128pxから選択。 |
| `decorative` | `false` | 名称併記・名前付きリンクではtrueにする。 |
| `className` / `class` | なし | 外側のspanに付与する配置用クラス。Reactは文字列、Vueはclass形式、Astroは文字列。 |

React：

```tsx
import { TLogo } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/tokens/neutrals.css';

<TLogo size={64} />
<a href="/" aria-label="Tokiwagi UI ホーム">
  <TLogo decorative />
  <span>Tokiwagi UI</span>
</a>
```

Vue：

```vue
<script setup lang="ts">
import { TLogo } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/tokens/neutrals.css';
</script>

<template>
  <TLogo :size="64" />
  <a href="/" aria-label="Tokiwagi UI ホーム">
    <TLogo decorative />
    <span>Tokiwagi UI</span>
  </a>
</template>
```

Astro：

```astro
---
import { TLogo } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/tokens/neutrals.css';
---
<TLogo size={64} />
<a href="/" aria-label="Tokiwagi UI ホーム">
  <TLogo decorative />
  <span>Tokiwagi UI</span>
</a>
```

`size` は画像自体の幅です。四辺に幅の1/4の余白を含むため、占有領域は32px指定で48px、64px指定で96px、128px指定で192pxの正方形です。余白の背景は `--tkw-color-neutral-0` を参照します。親の文字色は画像へ継承しません。

単体表示のaltは「Tokiwagi UI」、`decorative` 指定時は空です。操作は親のリンクに持たせてください。色・src・alt・style・追加属性・イベント・children／slotは公開せず、配置用classで内部のサイズや余白を上書きしないでください。不正なサイズと非booleanのdecorativeは描画時に日本語エラーで拒否します。

原本SVGをdata URLとして埋め込むため、CSPを使う配信先は `img-src` に `data:` を許可してください。React・VueのSSRとハイドレーションで同じ画像srcを使い、Astroはクライアント処理なしで静的HTMLを出力します。内部SVGのIDは文書へ展開しません。アプリ画面への適用は未実施です。


## TBrand（ロゴと名称）

固定名称・書体・間隔・親リンクとの役割分担は、[TBrandの利用ルール](../components/TBrand/README.md)を参照してください。

`TBrand` は既存 `TLogo` と固定名称「Tokiwagi UI」を横並び・縦中央揃えで表示する静的な部品です。LPのヘッダー・フッターやドキュメントで同じブランド表示を再利用できます。各方式の公開入口から `TBrand` と `TBrandProps` をインポートします。ローカルパッケージの導入条件は[各方式の利用説明](../README.md)を参照してください。LP・既存アプリへの適用は未実施です。

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `size` | `LogoSize = 32 \| 64 \| 128`、既定32 | ロゴ図形の幅。名称のサイズは変わらない |
| `className`（React） | `string` | 外側のspanに付与する配置用クラス |
| `class`（Vue） | `HTMLAttributes['class']` | 外側のspanに付与する文字列・配列・オブジェクト |
| `class`（Astro） | `string` | 外側のspanに付与する配置用クラス |

名称・書体・文字サイズ・間隔・内部ロゴのdecorativeは固定です。書体は既存見本と同じ `Inter, "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`、名称は16px・太さ600・行高1.5、ロゴ領域と名称の間隔は8pxです。フォントは利用側で配信し、未読込時はフォールバックします。名称の色は親から継承します。ロゴの固定配色は変えません。

```tsx
import { TBrand } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/tokens/neutrals.css';

<TBrand />;
<a href="/" aria-label="Tokiwagi UI ホーム" className="brand-home">
  <TBrand size={32} className="brand-position" />
</a>;
```

```vue
<script setup lang="ts">
import { TBrand } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/tokens/neutrals.css';
</script>

<template>
  <TBrand />
  <a href="/" aria-label="Tokiwagi UI ホーム" class="brand-home">
    <TBrand :size="32" class="brand-position" />
  </a>
</template>
```

```astro
---
import { TBrand } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/tokens/neutrals.css';
---
<TBrand />
<a href="/" aria-label="Tokiwagi UI ホーム" class="brand-home">
  <TBrand size={32} class="brand-position" />
</a>
```

```css
.brand-home { display: inline-flex; border-radius: 8px; color: var(--tkw-color-neutral-900); text-decoration: none; }
.brand-home:hover { background: var(--tkw-color-neutral-50); text-decoration: underline; text-underline-offset: 4px; }
.brand-home:active { background: var(--tkw-color-neutral-100); }
.brand-home:focus-visible { outline: 3px solid var(--tkw-color-neutral-900); outline-offset: 4px; }
```

内部の `TLogo` には `decorative` を指定し、画像のaltは空です。名称は通常のテキストとして一度だけ読み上げます。TBrand自体はフォーカスを持たず、リンク先・操作・操作名・ホバー・押下・フォーカスは親のa要素が担当します。ホームリンクには `aria-label="Tokiwagi UI ホーム"` を指定します。

追加の属性（id・role・aria-*・tabIndex・style・href等）・イベント・children／slotは内部DOMへ転送しません。Reactのrefも受け取りません。Vueのrefはフレームワークのコンポーネント参照であり、DOM参照のAPIは提供しません。名称を別の文言へ差し替えるAPIはありません。配置用classは外側だけに付け、内部の余白・寸法・配色を上書きしないでください。非対応サイズはTLogoの検証で描画時にも日本語エラーとして拒否します。

**占有領域**：TLogoが図形の四辺に幅の1/4の余白を確保するため、ロゴ領域は32px指定で48×48px、64px指定で96×96px、128px指定で192×192pxです。TBrandは外側のpaddingを追加しません。名称の行高は24pxで、全体の高さはロゴ領域と同じです。全幅は「ロゴ図形幅×1.5＋間隔8px＋名称の実測幅」で、フォントにより変わります。名称の右側の余白やリンクの操作領域は親で確保してください。ロゴと名称は縮小・折り返しません。利用先に収まるサイズを選んでください。

`neutrals.css` を読み込むとTLogoの余白の白背景を確保できます。SVGのdata URLを使うのでCSPの `img-src` に `data:` を許可します。React・VueはSSRとハイドレーションに対応し、Astroは静的HTMLを出力します。Storybook「コンポーネント/TBrand」で3方式の実コンポーネントを中央に1つ表示し、Controlsでサイズを切り替えられます。親ホームリンクの利用例は本資料を参照してください。Astro見本は別プロセスで実コンポーネントを描画し、静的Storybookに収録します。
