# 第三者ライセンスの調査結果

確認日：2026年10月24日。`package.json`、`bun.lock` と、このmacOS arm64環境にインストール済みのパッケージの `package.json`・ライセンス・通知文を参照しました。リポジトリのMIT対象と第三者の著作物は[適用範囲](../LICENSE-SCOPE.md)で区別します。

本書は調査メモです。第三者ライセンス・著作権表示・必要なNOTICEの全文の代用にはなりません。`node_modules/` は追跡・再配布しておらず、今回は第三者コードの新しい同梱や依存変更を行いません。将来配布する成果物については、その成果物に実際に含まれる著作物の通知を保持してください。

## 直接依存

通知ファイル欄は `node_modules/` からの相対パスです。同じパッケージの下位コードやバイナリは別の通知を含む場合があります。

| パッケージ | 確認バージョン | 宣言ライセンス | ローカルで確認した通知文 |
| --- | --- | --- | --- |
| `@tailwindcss/vite` | 4.3.3 | MIT | `@tailwindcss/vite/LICENSE` |
| `astro` | 7.3.4 | MIT | `astro/LICENSE` |
| `tailwindcss` | 4.3.3 | MIT | `tailwindcss/LICENSE` |
| `@astrojs/check` | 0.9.10 | MIT | `@astrojs/check/LICENSE` |
| `@astrojs/compiler-rs` | 0.4.1 | MIT | `@astrojs/compiler-rs/LICENSE` |
| `@storybook/addon-docs` | 10.6.0 | MIT | 個別LICENSEはルートで未検出。下記TODOを参照 |
| `@storybook/html-vite` | 10.6.0 | MIT | 個別LICENSEはルートで未検出。下記TODOを参照 |
| `@types/bun` | 1.3.9 | MIT | `@types/bun/LICENSE` |
| `@types/react` | 19.3.0 | MIT | `@types/react/LICENSE` |
| `@types/react-dom` | 19.3.0 | MIT | `@types/react-dom/LICENSE` |
| `@vue/server-renderer` | 3.5.22 | MIT | `@vue/server-renderer/LICENSE` |
| `happy-dom` | 20.14.5 | MIT | `happy-dom/LICENSE` |
| `react` | 19.3.0 | MIT | `react/LICENSE` |
| `react-dom` | 19.3.0 | MIT | `react-dom/LICENSE` |
| `remark-gfm` | 4.0.1 | MIT | `remark-gfm/license` |
| `storybook` | 10.6.0 | MIT | 個別LICENSEはルートで未検出。下記TODOを参照 |
| `typescript` | 5.9.3 | Apache-2.0 | `typescript/LICENSE.txt`、`typescript/ThirdPartyNoticeText.txt` |
| `vue` | 3.5.22 | MIT | `vue/LICENSE` |

## 間接依存の確認範囲

インストール済みの**432組のパッケージ名・バージョン**を重複排除して集計しました。これはBunロックファイルの全プラットフォーム・全optional依存の完全な一覧ではありません。環境にないパッケージ、Rustなどのバイナリ内の依存、最終的な配布物への収録範囲まではこの集計で保証しません。

| package.jsonの宣言 | パッケージ名・バージョンの組数 |
| --- | ---: |
| 0BSD | 1 |
| Apache-2.0 | 7 |
| BSD-2-Clause | 10 |
| BSD-3-Clause | 5 |
| BlueOak-1.0.0 | 3 |
| CC0-1.0 | 2 |
| ISC | 15 |
| LGPL-3.0-or-later | 1 |
| MIT | 383 |
| MPL-2.0 | 4 |
| Python-2.0 | 1 |

MIT以外の宣言を持つインストール済みパッケージは以下のとおりです。

| パッケージ | 宣言ライセンス | 通知ファイル（node_modules/からの相対パス） |
| --- | --- | --- |
| `@emmetio/html-matcher@1.3.0` | ISC | `@emmetio/html-matcher/LICENSE` |
| `@img/sharp-darwin-arm64@0.35.4` | Apache-2.0 | `@img/sharp-darwin-arm64/LICENSE` |
| `@img/sharp-libvips-darwin-arm64@1.3.3` | LGPL-3.0-or-later | ルートの独立した通知ファイルは未検出 |
| `@ungap/structured-clone@1.4.0` | ISC | `@ungap/structured-clone/LICENSE` |
| `anymatch@3.1.3` | ISC | `anymatch/LICENSE` |
| `argparse@2.0.1` | Python-2.0 | `argparse/LICENSE` |
| `aria-query@5.3.0` | Apache-2.0 | `@testing-library/dom/node_modules/aria-query/LICENSE` |
| `aria-query@5.3.2` | Apache-2.0 | `aria-query/LICENSE` |
| `axobject-query@4.1.0` | Apache-2.0 | `axobject-query/LICENSE` |
| `boolbase@1.0.0` | ISC | ルートの独立した通知ファイルは未検出 |
| `cliui@9.0.1` | ISC | `cliui/LICENSE.txt` |
| `common-ancestor-path@2.0.0` | BlueOak-1.0.0 | `common-ancestor-path/LICENSE.md` |
| `css-select@6.0.0` | BSD-2-Clause | `css-select/LICENSE` |
| `css-what@7.0.0` | BSD-2-Clause | `css-what/LICENSE` |
| `detect-libc@2.1.2` | Apache-2.0 | `detect-libc/LICENSE` |
| `diff@9.0.0` | BSD-3-Clause | `diff/LICENSE` |
| `domelementtype@2.3.0` | BSD-2-Clause | `domelementtype/LICENSE` |
| `domhandler@5.0.3` | BSD-2-Clause | `domhandler/LICENSE` |
| `domutils@3.2.2` | BSD-2-Clause | `domutils/LICENSE` |
| `entities@4.5.0` | BSD-2-Clause | `@vue/compiler-core/node_modules/entities/LICENSE` |
| `entities@7.0.1` | BSD-2-Clause | `entities/LICENSE` |
| `esprima@4.0.1` | BSD-2-Clause | `esprima/LICENSE.BSD` |
| `fast-uri@3.1.8` | BSD-3-Clause | `fast-uri/LICENSE` |
| `get-caller-file@2.0.5` | ISC | `get-caller-file/LICENSE.md` |
| `github-slugger@2.0.0` | ISC | `github-slugger/LICENSE` |
| `graceful-fs@4.2.11` | ISC | `graceful-fs/LICENSE` |
| `http-cache-semantics@4.2.0` | BSD-2-Clause | `http-cache-semantics/LICENSE` |
| `lightningcss@1.32.0` | MPL-2.0 | `@tailwindcss/node/node_modules/lightningcss/LICENSE` |
| `lightningcss@1.33.0` | MPL-2.0 | `lightningcss/LICENSE` |
| `lightningcss-darwin-arm64@1.32.0` | MPL-2.0 | `@tailwindcss/node/node_modules/lightningcss/node_modules/lightningcss-darwin-arm64/LICENSE` |
| `lightningcss-darwin-arm64@1.33.0` | MPL-2.0 | `vite/node_modules/lightningcss/node_modules/lightningcss-darwin-arm64/LICENSE` |
| `lru-cache@11.5.3` | BlueOak-1.0.0 | `lru-cache/LICENSE.md` |
| `mdn-data@2.0.28` | CC0-1.0 | `csso/node_modules/css-tree/node_modules/mdn-data/LICENSE` |
| `mdn-data@2.27.1` | CC0-1.0 | `mdn-data/LICENSE` |
| `nth-check@2.1.1` | BSD-2-Clause | `nth-check/LICENSE` |
| `piccolore@0.1.3` | ISC | ルートの独立した通知ファイルは未検出 |
| `picocolors@1.1.1` | ISC | `picocolors/LICENSE` |
| `sax@1.6.1` | BlueOak-1.0.0 | `sax/LICENSE.md` |
| `semver@7.8.5` | ISC | `semver/LICENSE` |
| `sharp@0.35.4` | Apache-2.0 | `sharp/LICENSE` |
| `smol-toml@1.9.0` | BSD-3-Clause | `smol-toml/LICENSE` |
| `source-map@0.6.1` | BSD-3-Clause | `source-map/LICENSE` |
| `source-map-js@1.2.1` | BSD-3-Clause | `source-map-js/LICENSE` |
| `tslib@2.8.1` | 0BSD | `tslib/LICENSE.txt` |
| `typescript@5.9.3` | Apache-2.0 | `typescript/LICENSE.txt` |
| `y18n@5.0.8` | ISC | `y18n/LICENSE` |
| `yaml@2.8.3` | ISC | `yaml-language-server/node_modules/yaml/LICENSE` |
| `yaml@2.9.1` | ISC | `yaml/LICENSE` |
| `yargs-parser@22.0.0` | ISC | `yargs-parser/LICENSE.txt` |

## 特に分けて扱う通知

- TypeScriptには `node_modules/typescript/LICENSE.txt` と `ThirdPartyNoticeText.txt` があります。Apache-2.0の表示だけで第三者通知を置き換えないでください。
- Lightning CSSとそのネイティブパッケージはMPL-2.0です。`node_modules/lightningcss/LICENSE` および各パッケージのLICENSEを参照してください。
- sharp自体はApache-2.0ですが、macOS arm64用の `@img/sharp-libvips-darwin-arm64@1.3.3` はLGPL-3.0-or-laterを宣言しています。同パッケージのREADMEにはlibvips以外の組込みライブラリとそのライセンスも記載されています。`versions.json` に同梱バージョンがあり、libpng・freetype・fontconfig・mozjpeg・aomなどはそれぞれ別の条件を持ちます。開発用ツールのライセンスと自作UIコードのMITは別です。バイナリを再配布する場合の条件は、実際の配布構成を確定して確認する必要があります。[sharp公式のライセンス案内](https://sharp.pixelplumbing.com/install/#licensing)も参照してください。
- `storybook` のパッケージルートでは独立したLICENSEを検出できませんでした。宣言はMITですが、配布物のバンドル内通知も個別確認が必要です。

## SVG・フォント・画像

- 汎用SVG329種は `icons/<公開名>/<公開名>.svg` に収録され、ロゴは別管理です。汎用SVGの初回収録コミットは `e34983f`、ロゴは `ed7d7b0`。権利者の申告に基づき、汎用SVGはMIT対象、ロゴはMIT対象外とします。
- TODO：Gitへの収録以前の制作履歴・外部素材の流用有無を証明する資料はリポジトリ内で確認できていません。第三者の権利がある素材をMITへ変更したと解釈しないでください。
- 追跡対象に `.woff`・`.woff2`・`.ttf`・`.otf` のフォントファイル、PNG/JPEGの独自画像はありません。自作SVGとLP内のCSSによる図形表現は存在します。
- CSSとTBrandで `Inter`・`Noto Sans JP`・システムフォントを指定していますが、フォント本体の同梱や外部フォント取得の設定は見つかりません。未取得時はフォールバックします。利用側がフォントを配信・同梱する場合は、取得元・版・ライセンスを別途確認してください。

## 残る確認事項

- TODO：未インストールの別OS・CPU向けoptional依存と、ネイティブバイナリ内の依存・通知の完全照合。
- TODO：独立した通知ファイルがルートで見つからないパッケージの、配布ソースやバンドル内通知の確認。
- TODO：最終的に配布する成果物を確定した際の依存収録範囲と必要な通知・ソース提供等の確認。今回npm公開・静的サイト公開・第三者バイナリ配布は行いません。
