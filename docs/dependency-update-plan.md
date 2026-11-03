# 依存関係と実行環境の更新計画

確認・合意日：2026年11月3日（日本時間）。対象：`tokiwagi-ui`。

技術・パッケージを以下の順序で更新する。順序は、確認できたセキュリティ修正、実行環境の要件、依存関係、変更リスクをもとに決定した。新しい安定版があることだけを理由に、すべてを緊急の更新とは扱わない。

本書は更新計画であり、依存関係や実行環境を更新した実績ではない。下記はすべて未着手で、更新後の互換性も未検証。現行・目標バージョンは確認日時点の記録とし、各段階の着手時に公式の安定版、動作要件、対応範囲を再確認する。

## 更新順序と重要度

| 順番 | 重要度 | 対象 | 現行 | 目標 | 理由・進め方 |
| --- | --- | --- | --- | --- | --- |
| 1 | 最優先 | `storybook`、`@storybook/addon-a11y`、`@storybook/addon-docs`、`@storybook/addon-vitest`、`@storybook/html-vite` | 10.6.0 | 10.6.5 | 本体とVitestアドオンの現行版がセキュリティ修正の対象。同じ版に揃え、既存の独自パッチも確認する。 |
| 2 | 高 | Node.js（CI・Dev Container） | 22.16.0 | 22.23.4 | 最新AstroのNode.js要件を満たす。22系を維持し、CIとDev Containerを揃える。 |
| 3 | 中 | Bun、`@types/bun` | 1.3.9 | 1.4.4 | 依存管理・テストの実行基盤を更新し、後続の検証環境を固定する。型定義の現行版は`bun.lock`の固定値。 |
| 4 | 中 | Astro | 7.3.4 | 7.4.5 | Node.js更新後に実施し、紹介ページとAstro実コンポーネントの描画を確認する。 |
| 4 | 中 | `@astrojs/check` | 0.9.10 | 0.9.12 | Astro関連の型チェックを更新する。TypeScript本体の更新は段階10で行う。 |
| 4 | 中 | `@astrojs/compiler-rs` | 0.4.1 | 0.5.2 | Astroコンパイラーを更新し、実コンポーネントとStorybook用見本の生成を確認する。 |
| 4 | 中 | Vite（間接依存） | 8.3.0 | 8.3.5 | Astro更新に伴い依存元との整合性と`bun.lock`の解決結果を確認する。直接依存への追加は不要。 |
| 5 | 中 | `react`、`react-dom` | 19.3.0 | 19.3.1 | 同じ版に揃え、公開コンポーネントとReact 18・19の互換性を検証する。 |
| 6 | 中 | `vue`、`@vue/server-renderer` | 3.5.22 | 3.5.44 | 同じ版に揃え、SSR・ハイドレーションを確認する。 |
| 7 | 中 | `tailwindcss`、`@tailwindcss/vite` | 4.3.3 | 4.3.4 | 同じ版に揃え、CSS出力と画面表示を確認する。 |
| 8 | 低・計画更新 | `vitest`、`@vitest/browser-playwright`、`@vitest/coverage-istanbul`、`@vitest/coverage-v8` | 4.1.12 | 5.1.0 | メジャー更新。Storybook更新後に同じ版へ揃え、ブラウザーテストとカバレッジを検証する。 |
| 9 | 低・計画更新 | `happy-dom` | 20.14.5 | 21.0.4 | メジャー更新。DOM・ハイドレーションの既存テストへの影響を確認する。 |
| 10 | 低・計画更新 | TypeScript | 5.9.3 | 6.0.3 | 型チェックの変更を実行時の更新から分け、最後に対応する。最新安定版7.0.2への更新は保留する。 |

## 優先順位と更新先の判断

### 1. Storybookのセキュリティ修正と独自パッチ

[GHSA-px85-f4q5-jh77](https://github.com/storybookjs/storybook/security/advisories/GHSA-px85-f4q5-jh77)では、`storybook`と`@storybook/addon-vitest`の10.6.0が影響範囲に含まれ、10.6.2以降で修正されている。この修正を含む安定版10.6.5へ更新する。

現在の起動スクリプトは`--host 127.0.0.1`を指定している。公式アドバイザリーでは、ほかの端末から到達できない開発サーバーは影響対象外としているため、実際のポート公開・転送設定も含めて到達範囲を確認する。静的ビルドの配信と開発サーバーの公開は区別する。

[package.json](../package.json)の`patchedDependencies`には、本体とVitestアドオンの2パッチがある。

- `patches/storybook@10.6.0.patch`：Universal Storeの同期待ち時間とWebSocketの許容遅延を延長する。
- `patches/@storybook%2Faddon-vitest@10.6.0.patch`：手動再実行時のブラウザーセッション、IPCの状態履歴・イベント再送を調整する。

更新先で修正済みか、引き続き必要かを確認し、必要な変更だけを更新先のコードに合わせる。パッチを外すだけで完了とはせず、既存の再実行・カバレッジ・メモリ対策が維持されるか確認する。

### 2. Node.jsをAstroより先に更新する

[Astro 7.4.5の公開メタデータ](https://registry.npmjs.org/astro/7.4.5)はNode.js `>=22.23.4`を要求する。現行の22.16.0では要件を満たさないため、段階2でCIとDev Containerを更新してから段階4へ進む。

確認日時点の最新LTSは26.13.0だが、本計画で26系への移行は必須としない。22系の22.23.4を更新先とする。[Node.js公式配布一覧](https://nodejs.org/dist/index.json)で確認する。

### 3. TypeScript 7は保留する

確認日時点の最新安定版はTypeScript 7.0.2だが、[`@astrojs/check@0.9.12`](https://registry.npmjs.org/@astrojs/check/0.9.12)の`peerDependencies.typescript`は`^5.0.0 || ^6.0.0`である。現構成では対応範囲内の安定版6.0.3を候補とし、7系は対応確認後の別判断とする。

段階10では型エラー、設定の変更、React・Vue・Astroの公開型への影響を確認する。未検証の状態で6.0.3への移行が保証されているとは扱わない。

## リポジトリ内の更新箇所

| 対象 | 更新・確認する箇所 |
| --- | --- |
| 直接依存 | `package.json`と`bun.lock`。同じ系列の本体・関連パッケージは表の組み合わせで揃える。 |
| `@types/bun` | 現行指定は`^1.3.9`。指定範囲に含まれていても、使用版を更新するには`bun.lock`を更新する。Bun本体との整合性も確認する。 |
| Vite | 依存元と`bun.lock`。Astro 7.4.5はVite `^8.3.5`を要求するため、その解決結果を確認する。 |
| Bun | `package.json`の`packageManager`、`.github/workflows/`の固定版、`.devcontainer/Dockerfile`。 |
| Node.js | `.github/workflows/`の固定版と`.devcontainer/devcontainer.json`。 |
| 既存の説明 | 実際の更新段階で`README.md`、`AGENTS.md`、`docs/wiki/`などのバージョン記載と整合させる。 |

手元のMacでBun・Node.jsを更新するだけでは、CI・Dev Containerの使用版は変わらない。本計画をプロジェクト全体へ反映するにはリポジトリ内の固定版も更新する。

## 各段階の検証

段階ごとに変更と検証結果を記録し、失敗・未検証の範囲を明示してから次へ進む。既存の検証手順は[Testing](wiki/Testing.md)を参照する。

共通の型検査・単体テスト・ビルドは次のコマンドを使う。更新後の`bun.lock`が固定インストールで再現できることも確認する。

```sh
bun install --frozen-lockfile
bun run check
bun test
bun run build
bun run build:storybook
```

| 段階 | 重点的に確認する内容 |
| --- | --- |
| 1：Storybook | `bun run test:storybook`、`bun run test:storybook --coverage`、Storybook内の手動再実行、Controls・Docs・アクセシビリティ検査。独自パッチが対象とした同期・再実行・IPCの挙動。 |
| 2・3：Node.js・Bun | CI・Dev Containerと更新後の実行版の一致、固定インストール、共通コマンド、Storybookテストの起動・完了。 |
| 4：Astro関連・Vite | 全329図柄×4サイズのAstro実コンポーネント描画、紹介ページ、Storybook用Astro見本の生成・読み込み・再試行。 |
| 5：React | `bun run check:react-compat`によるReact 18・19の公開型・SSR・ハイドレーション、既存コンポーネントテスト。 |
| 6：Vue | VueコンポーネントのSSR・ハイドレーション、ID分離、props更新の既存テスト。 |
| 7：Tailwind CSS | 既存トークンを使ったCSS出力、紹介ページ・Storybookのモバイル／デスクトップ表示、フォーカス・ホバー・押下。 |
| 8：Vitest関連 | `bun run test:storybook`、`bun run test:storybook --coverage`、Storybook内の手動再実行とカバレッジ切り替え。 |
| 9：happy-dom | `bun test`と`bun run check:react-compat`によるDOM・SSR・ハイドレーションの回帰確認。 |
| 10：TypeScript | `bun run check`、`bun run check:react-compat`、両ビルドで公開型・テンプレート・設定との互換性を確認。 |

UIへ影響する更新では、リポジトリの既存ルールに従ってブラウザー確認と`bun run test:visual`による画像比較も行う。画像比較の基準は更新せず、実Safari・VoiceOverの確認とは区別する。必要なUI添付・検証の手順は[AGENTS.md](../AGENTS.md)に従う。

## 確認日時点で更新対象外の直接依存

次のパッケージは確認日時点の最新安定版と一致しているため、本計画では更新しない。

| パッケージ | 現行＝確認日時点の最新安定版 |
| --- | --- |
| `@playwright/test` | 1.64.1 |
| `@chromatic-com/storybook` | 5.6.0 |
| `@types/react`、`@types/react-dom` | 19.3.0 |
| `fflate` | 0.8.3 |
| `http-server` | 14.1.1 |
| `remark-gfm` | 4.0.1 |

## 調査元

現行版は[package.json](../package.json)、[bun.lock](../bun.lock)、[CI設定](../.github/workflows/ci.yml)、[Dev Container設定](../.devcontainer/devcontainer.json)、[Dockerfile](../.devcontainer/Dockerfile)を確認した。

更新先はnpm公式レジストリの各パッケージの`dist-tags.latest`と公開バージョンのメタデータを確認した。主要な参照先は以下のとおり。

- [Storybook 10.6.5](https://github.com/storybookjs/storybook/releases/tag/v10.6.5)・[セキュリティアドバイザリー](https://github.com/storybookjs/storybook/security/advisories/GHSA-px85-f4q5-jh77)
- [Astro](https://registry.npmjs.org/astro/latest)・[Astro Check](https://registry.npmjs.org/@astrojs/check/latest)・[Astro Compiler RS](https://registry.npmjs.org/@astrojs/compiler-rs/latest)・[Vite](https://registry.npmjs.org/vite/latest)
- [React](https://registry.npmjs.org/react/latest)・[Vue](https://registry.npmjs.org/vue/latest)・[Tailwind CSS](https://registry.npmjs.org/tailwindcss/latest)
- [Vitest](https://registry.npmjs.org/vitest/latest)・[Happy DOM](https://registry.npmjs.org/happy-dom/latest)・[TypeScript](https://registry.npmjs.org/typescript/latest)
- [Bun](https://bun.sh/blog)・[Bunの型定義](https://registry.npmjs.org/@types/bun/latest)・[Node.js公式配布一覧](https://nodejs.org/dist/index.json)
