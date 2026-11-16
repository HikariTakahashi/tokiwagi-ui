# Node.js 22.23.4への更新記録

再確認日：2026年11月16日（日本時間）。[Issue #96](https://github.com/HikariTakahashi/tokiwagi-ui/issues/96)、[更新計画の段階2](dependency-update-plan.md)に対応する。先行する[段階1のStorybook更新](dependency-update-95.md)はmainへマージ済み。

## 更新先と変更範囲

[Node.js公式リリース](https://nodejs.org/en/blog/release/v22.23.4)と[GitHub Actions向け配布](https://github.com/actions/node-versions/releases/tag/22.23.4-39619033003)で22.23.4が取得できることを確認した。[Astro 7.4.5の公式npmメタデータ](https://registry.npmjs.org/astro/7.4.5)はNode.js `>=22.23.4`を要求するため、後続のAstro更新より先に実行環境を揃える。

2026年11月11日に同じ22系の[セキュリティ修正版22.23.5](https://nodejs.org/en/blog/release/v22.23.5)も公開された。今回の設定と検証はIssueが指定する22.23.4で行う。22.23.5を採用する場合は、CIとDev Containerの指定を同時に変更し、実行版と関連チェックを再確認する。

- `.github/workflows/ci.yml`の5ジョブと`visual.yml`の1ジョブを22.16.0から22.23.4へ更新し、各ジョブで`node --version`をログへ残す。
- `.devcontainer/devcontainer.json`のNode Featureの指定を22.23.4へ更新する。Feature本体のバージョン・digestを固定する`devcontainer-lock.json`は変更不要。
- Wiki原稿のSetup・Testingを更新し、コンテナ再構築後の版確認と、画像比較用コンテナ内に導入するNode.jsも揃える。計画表と過去の検証記録にある更新前バージョンは履歴として保持する。

Bun 1.3.9、Ubuntu 24.04、アプリ依存、`package.json`・`bun.lock`、公開API、SVG原本、トークン値は維持する。

## 実行環境と検証

最新のmain（`82fc43e`）を基点にした追跡ファイルを一時ディレクトリへコピーし、Dev Containers CLIで新規コンテナを構築した。既存の作業用コンテナと依存ボリュームは保持し、検証側は専用の`node_modules`ボリュームを使用した。`postCreateCommand`の固定インストールも成功した。

Ubuntu 24.04・Linux arm64の検証コンテナで、`node --version`は`v22.23.4`、`bun --version`は`1.3.9`だった。以下のコマンドをこの環境で実行した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | 成功。postCreateと再実行で固定導入を確認。 |
| `bun run check` | 成功。515ファイル、エラー0・警告0・ヒント1（既存のReact test-utilsのact非推奨）。 |
| `bun test` | 成功。55ファイル、228件成功、0件失敗。 |
| `bun run build` | 成功。Astroの1ページを出力。 |
| `bun run build:storybook` | 成功。Astro実コンポーネント見本を含む静的出力を生成。 |
| `bun run check:react-compat` | 成功。React 18.0.0・18.3.1・19.0.0・19.3.0の公開型・SSR・ハイドレーション・props更新を各31件検証。 |
| `bun run test:storybook` | 成功。`bunx playwright install --with-deps chromium`で準備し、Chromium上の339ファイル・347件がすべて完了。 |
| Workflowの静的検証 | actionlint成功。6ジョブのNode.js固定版と実行版出力、Dev Container設定との一致を確認。CIの変更判定で全6チェックが選ばれることも確認。 |

GitHub Actions上での実行版と各ジョブの結果は未確認。PRのCI・Visual Testsのログで、対象6ジョブの `node --version` が `v22.23.4` であり、各チェックが完了することを確認する。Wikiの公開はmainへのマージとSync Wiki成功後に確認する。今回の変更は実行環境・設定・文書に限る。画像比較・ブラウザーでの目視確認・実Safari・VoiceOverはローカルでは実施していない。
