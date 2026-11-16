# Tailwind CSS・Viteプラグインの更新記録

確認日：2026年11月16日（日本時間）。[Issue #101](https://github.com/HikariTakahashi/tokiwagi-ui/issues/101)、[更新計画の段階7](dependency-update-plan.md)に対応する。先行するVue更新の[検証結果](dependency-update-100.md)と[PR #115のmainへのマージ](https://github.com/HikariTakahashi/tokiwagi-ui/pull/115)を確認して着手した。

## 採用したバージョンと変更範囲

[`tailwindcss`](https://registry.npmjs.org/tailwindcss/4.3.4) と [`@tailwindcss/vite`](https://registry.npmjs.org/@tailwindcss/vite/4.3.4) を4.3.3から4.3.4に揃えた。[公式リリース](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.4)とnpmの公開メタデータを確認した。両パッケージの `latest` は4.3.5だったが、今回はIssue指定の4.3.4を採用した。プラグインのVite対応範囲は `^5.2.0 || ^6 || ^7 || ^8` で、既存のVite 8.3.5は範囲内。Node.js 22.23.4でViteとOxideの実行要件も満たす。

`bun.lock` の差分はTailwind CSSとその配下に限られる。Tailwindの実行・スキャン関連のパッケージは4.3.4に揃い、Lightning CSSは既存の1.33.0を共有するためTailwind配下の1.32.0がなくなった。開発環境とCIは `bun.lock` を使うため、既存の `package-lock.json` は変更していない。READMEの現行版を更新した。両パッケージの宣言ライセンスはMITで、配布物内のLICENSEは4.3.3と一致した。

## 共有テーマと生成CSS

`tokens/tailwind.css` の `@theme inline`、全93色の値・用途、フォントの定義、Preflightを読み込まない設定を維持した。既存のテストで93色から生成する背景・文字・境界線・ホバー・押下のユーティリティと、フォント用ユーティリティが元の変数を参照することを確認した。

紹介ページとStorybookのプレビューの生成CSSを、先行するVue更新時の4.3.3の出力と比較した。差分はTailwindの版表示、Safari向けの機能判定を `margin-trim: inline` から `margin-trim: block` に切り替える修正、空の `var()` フォールバックへの空白追加だった。生成CSSの既存トークン参照に差はなく、互換性のためのアプリ側の変更は不要だった。

## 検証結果

macOSでNode.js 22.23.4・Bun 1.4.4を使用した。画像比較はCIと同じ固定Playwright 1.64.1コンテナー（Linux amd64）で実行した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | macOSと固定Playwrightコンテナーで成功。どちらもインストール前後で `bun.lock` のSHA-256が一致。 |
| `bun run check` | 515ファイル、エラー0・警告0。既存のReact `act` 非推奨のヒント1件。 |
| `bun test` | 55ファイル、228件成功。 |
| `bun run build` / `bun run build:storybook` | 両方成功。Storybookには既存の拡張子なしimportとチャンクサイズの警告あり。 |
| `bun run test:visual` | Firefox・WebKitの全64件が一致。承認済み基準の生成元は `e020d560061ee00b63fb3ddc97827047f4a81c83`。基準画像は更新していない。 |
| 紹介ページ・静的Storybookの操作 | Chromiumの1440×900・390×844で表示を確認。Tabフォーカス、ポインターのホバー・押下・解除、紹介ページのアンカー移動、StorybookのヘッダーボタンのSpace操作を確認。 |

Chromiumで撮影した紹介ページとStorybookのヘッダーボタン押下状態は、両画面幅で更新前の画像と一致した。紹介ページの主リンク「Storybook で見る」は、文字色と背景色が同じになる[既知の事象](dependency-update-98.md)を更新前後で確認した。スクリーンショットはローカルの `test-results/ui/` に保存した。実Safari・VoiceOverと、今回の変更に対するGitHub Actionsは未確認。
