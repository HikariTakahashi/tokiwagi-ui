# ライセンスの適用範囲

## MIT対象

リポジトリ直下の[LICENSE](LICENSE)は、Hikari Takahashiが権利を保有するコード・関連文書のうち、以下のブランド除外と第三者著作物を除いたものに適用します。TIconのReact・Vue・Astro実装、汎用SVG329種（`icons/logo/` を除く）、カラートークンとTailwindテーマ、共通処理、一般の開発・資料コードを含みます。

著作権表示は `Copyright (c) 2026 Hikari Takahashi` です。MIT対象は商用利用・改変・再配布が可能で、著作権表示とライセンス文を保持する必要があります。無保証・免責などの正式な条件はLICENSEの全文に従います。本書はMIT本文を変更するものではありません。

## MIT対象外のブランド資産・専用ファイル

以下はHikari Takahashiが権利を保持し、本リポジトリのMIT Licenseによる利用許諾の対象に含めません。公開リポジトリへの掲載、各フレームワーク入口からのexport、見本・ダウンロード機能は継続しますが、それ自体は利用許諾ではありません。利用を希望する場合は[権利者](https://github.com/HikariTakahashi)へ別途確認してください。

具体的な対象ファイルは次のとおりです（テスト・型検査・専用見本・専用資料も含む）。名前の似た `logout`・`logout-off` は汎用アイコンであり、この除外に含めません。

- `.storybook/astro-brand-previews.ts`
- `.storybook/astro-logo-previews.ts`
- `components/TBrand/README.md`
- `components/TLogo/README.md`
- `docs/brand-reference.md`
- `icons/logo/README.md`
- `icons/logo/logo.svg`
- `scripts/render-astro-brand-previews.ts`
- `scripts/render-astro-logo-previews.ts`
- `src/astro/TBrand.astro`
- `src/astro/TBrand.test.ts`
- `src/astro/TBrand.typecheck.ts`
- `src/astro/TBrandProps.ts`
- `src/astro/TLogo.astro`
- `src/astro/TLogo.test.ts`
- `src/astro/TLogo.typecheck.ts`
- `src/astro/TLogoProps.ts`
- `src/icons/logo.mdx`
- `src/lib/brand-test-helpers.ts`
- `src/lib/brand.ts`
- `src/lib/logo-test-helpers.ts`
- `src/lib/logo.ts`
- `src/react/TBrand.hydration.test.tsx`
- `src/react/TBrand.test.tsx`
- `src/react/TBrand.tsx`
- `src/react/TBrand.typecheck.tsx`
- `src/react/TLogo.test.tsx`
- `src/react/TLogo.tsx`
- `src/react/TLogo.typecheck.tsx`
- `src/stories/TBrand.stories.ts`
- `src/stories/TLogo.stories.ts`
- `src/stories/astro-brand-previews.test.ts`
- `src/stories/astro-brand-previews.ts`
- `src/stories/astro-logo-previews.test.ts`
- `src/stories/astro-logo-previews.ts`
- `src/stories/component-rules/TBrand.mdx`
- `src/stories/component-rules/TLogo.mdx`
- `src/stories/components/LogoPreview.tsx`
- `src/stories/components/logo-preview.css`
- `src/stories/logo-readme.test.ts`
- `src/stories/logo-readme.ts`
- `src/vue/TBrand.hydration.test.ts`
- `src/vue/TBrand.test.ts`
- `src/vue/TBrand.ts`
- `src/vue/TBrand.typecheck.ts`
- `src/vue/TLogo.hydration.test.ts`
- `src/vue/TLogo.test.ts`
- `src/vue/TLogo.ts`
- `src/vue/TLogo.typecheck.ts`

共有ファイル内では、`src/pages/index.astro` のTokiwagi UIの名称・ロゴ見本（`.brand-mark` による図形表現）もブランド表現として除外します。ページの一般的なレイアウト・処理コード全体を除外するものではありません。名称の文字列やロゴ見本を含む他の共有資料も、そのブランド表現自体の権利は本MITでは許諾しません。

`src/react/index.ts`・`src/vue/index.ts`・`src/astro/index.ts`、Storybookの共有設定などにあるimport・export・参照だけで、参照先の除外対象がMITへ変わることはありません。MIT対象のコードと、取り込まれるブランド資産・専用コードを区別してください。

この区分は対象物の境界です。MIT対象の利用条件へブランドのサイズ・配色・用途の制限を追加するものではありません。現時点ではブランド対象の別の一般利用ライセンスは付与していません。ブランドファイルを追加・移動する際はこの一覧も更新してください。

## 第三者の著作物

依存パッケージ、同梱された第三者コード・素材には、それぞれの元のライセンスが適用されます。本プロジェクトのMITでは再許諾しません。[第三者ライセンスの調査結果](docs/THIRD-PARTY-LICENSES.md)を参照してください。

汎用SVGのMIT適用は権利者の申告に基づきます。外部素材の混入や制作元に関する資料で未確認の事項は、同調査結果にTODOとして記録しています。
