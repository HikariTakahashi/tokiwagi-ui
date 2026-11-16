# Bunと型定義の1.4.4への更新記録

再確認日：2026年11月16日（日本時間）。[Issue #97](https://github.com/HikariTakahashi/tokiwagi-ui/issues/97)、[更新計画の段階3](dependency-update-plan.md)に対応する。[段階2のNode.js更新](dependency-update-96.md)はmainへマージ済み。

## 更新範囲とロックファイル

[Bunの公式リリース](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.4)と[npmの公開メタデータ](https://registry.npmjs.org/@types/bun/latest)で、Bunの最新安定版と`@types/bun`の`latest`がどちらも1.4.4であることを確認した。

- `package.json`の`packageManager`、Dev Containerの`oven/bun`イメージ、全5ワークフローのBun導入11箇所を1.4.4に揃えた。Actionsでは各導入直後に`bun --version`を記録する。
- Bun本体と型定義を同じ版に保つため、`@types/bun`も1.4.4に固定した。Bun 1.4.4の`bun add --dev --exact --lockfile-only @types/bun@1.4.4`で`bun.lock`を生成した。
- `bun.lock`のパッケージ差分は`@types/bun`と、その依存の`bun-types`の2つだけ。新版の`bun-types`は`undici-types`を直接参照するが、既存の8.9.0で解決される。`@types/node`を含む他の解決版、既存のStorybookパッチ、`package-lock.json`はそのまま。
- Node.js 22.23.4とUbuntu 24.04での検証を継続する。過去の検証記録と計画策定時のバージョンは履歴として保持する。

## 検証

mainの`f756f10`に設定差分を適用した一時コピーで、Dev Containers CLIを使って新規構築した。既存の開発コンテナと依存ボリュームは変更していない。Ubuntu 24.04（Linux arm64）でNode.js `v22.23.4`、Bun `1.4.4`、インストール済みの`@types/bun`と`bun-types`がともに`1.4.4`であることを確認した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | 成功。初回構築時と再実行で確認し、`bun.lock`は書き換わらなかった。 |
| `bun run check` | 成功。515ファイル、エラー0・警告0。既存のReactの`act`非推奨のヒント1件。 |
| `bun test` | 成功。55ファイル、228件成功、0件失敗。 |
| `bun run build` | 成功。Astroの紹介ページを出力。 |
| `bun run build:storybook` | 成功。Astro実コンポーネントの見本を含む静的出力を生成。 |
| `CI=true bun run test:storybook` | 成功。`bunx playwright install --with-deps chromium`で準備し、Chromiumで339ファイル・347件すべてが完了。 |
| `bun run check:react-compat` | 成功。React 18.0.0・18.3.1・19.0.0・19.3.0の公開型と、SSR・ハイドレーション・props更新を各31件検証。 |
| Workflowの静的検証 | actionlintに成功。Bun導入11箇所の固定版と実行版出力を照合し、変更判定で全6チェックが選ばれることも確認した。 |

GitHub Actions上でのBunの実行版と各ジョブの結果は未確認。PRのCI・Visual Testsで`bun --version`と検証結果を確認する。変更は実行環境・開発用型定義・文書に限るため、ローカルでの目視確認・画像比較は対象外とした。Wikiの公開はmainへのマージとSync Wikiの成功後に確認する。
