# Astro関連とViteの更新記録

確認日：2026年11月16日（日本時間）。[Issue #98](https://github.com/HikariTakahashi/tokiwagi-ui/issues/98)、[更新計画の段階4](dependency-update-plan.md)に対応する。前提の[Node.js 22.23.4](dependency-update-96.md)と[Bun 1.4.4](dependency-update-97.md)はmainへマージ済み。

## 採用したバージョン

| パッケージ | 更新先 | 動作要件 |
| --- | --- | --- |
| [`astro`](https://registry.npmjs.org/astro/7.4.5) | 7.4.5 | Node.js `>=22.23.4`、Vite `^8.3.5`、`@astrojs/compiler-rs` `^0.5.1` |
| [`@astrojs/check`](https://registry.npmjs.org/@astrojs/check/0.9.12) | 0.9.12 | TypeScript `^5.0.0 \|\| ^6.0.0` |
| [`@astrojs/compiler-rs`](https://registry.npmjs.org/@astrojs/compiler-rs/0.5.2) | 0.5.2 | Node.js `>=22.12.0` |
| [`vite`](https://registry.npmjs.org/vite/8.3.5) | 8.3.5 | Node.js `^20.19.0 \|\| >=22.12.0` |

npmレジストリの `latest` はAstro 7.4.12、Astro Check 0.9.12、Astro Compiler RS 0.5.3、Vite 8.3.8だった。今回はIssue指定の組み合わせを採用し、TypeScriptは5.9.3を使用する。

`bun.lock`ではViteを間接依存として8.3.5に統一した。Viteを参照するAstro、StorybookのHTMLフレームワークとビルダー、Vitest、Tailwind CSSのViteプラグインがすべて同じインストール先を使用することを確認した。固定インストール前後でロックファイルのハッシュは一致した。

## 検証結果

macOSでNode.js 22.23.4・Bun 1.4.4を使用した。画像比較はCIと同じ固定Playwrightコンテナー（Linux amd64）で実行した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | macOSと固定Playwrightコンテナーで成功。 |
| `bun run check` | 515ファイル、エラー0・警告0。既存のReact `act` 非推奨のヒント1件。 |
| `bun test` | 55ファイル、228件成功。Astro実コンポーネントで全329図柄×4サイズを描画し、形状・寸法・装飾属性を原本と照合。 |
| `bun run build` | 紹介ページ1件を出力。 |
| `bun run build:storybook` | 静的出力にAstro実コンポーネントの見本JSONを収録。拡張子なしのimportとチャンクサイズに関する警告あり。 |
| `CI=true bun run test:storybook` | Chromiumで339ファイル、347件成功。 |
| `bun run test:visual` | Playwright 1.64.1のFirefox・WebKitで全64件成功。既存基準の生成元は `e020d560061ee00b63fb3ddc97827047f4a81c83`。 |
| 紹介ページと静的Storybook | Chromiumの1440×900・390×844で表示とTabフォーカス、ホバー、押下、押下解除を確認。紹介ページのヘッダーから「基盤」への移動も確認。 |
| Astro見本の取得と再試行 | 両画面幅でアイコンJSONの初回取得をHTTP 503にし、エラー表示から再試行するとHTTP 200で復旧。329図柄×4サイズの収録とmoonの32px表示・クリッピング参照を確認。 |

紹介ページの主リンク「Storybook で見る」は、更新前のmainと更新後の両方で文字色と背景色が同じ `rgb(37, 38, 42)` になる。Chromiumの計算済みスタイルを比較し、生成CSSもバイト単位で一致することを確認した。

実Safari・VoiceOver、GitHub Actionsでの実行、Wiki公開は未確認。
