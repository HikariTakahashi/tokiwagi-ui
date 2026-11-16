# Vue・サーバーレンダラーの更新記録

確認日：2026年11月16日（日本時間）。[Issue #100](https://github.com/HikariTakahashi/tokiwagi-ui/issues/100)、[更新計画の段階6](dependency-update-plan.md)に対応する。前提のReact・React DOM更新は[PR #114](https://github.com/HikariTakahashi/tokiwagi-ui/pull/114)でmainへマージ済み。

## 採用したバージョンと変更範囲

開発依存の[`vue`](https://registry.npmjs.org/vue/3.5.44)と[`@vue/server-renderer`](https://registry.npmjs.org/@vue/server-renderer/3.5.44)を3.5.22から3.5.44に揃えた。[Vueの公式リリース](https://github.com/vuejs/core/releases/tag/v3.5.44)とnpmの公開メタデータを確認した。両者の`latest`は3.5.45だったが、今回はIssue指定の3.5.44を採用した。3.5.44の両パッケージにNode.jsの`engines`指定はなく、Vue本体とサーバーレンダラーは同じ3.5.44の`@vue/runtime-dom`を使用する。利用側のVue対応範囲は`>=3.5.0 <4`を維持し、今回の動作検証は3.5.44で行った。

`bun.lock`ではVueのランタイム・コンパイラーを含む10パッケージを3.5.44に統一した。Vueのコンパイラーが要求するBabel parserとsource-map-jsはVue配下で解決し、entitiesとPostCSSは既存のルート解決版を共有する。ロックファイルの差分はVueとその配下の依存に限られる。開発環境・CIの固定インストールに使うのは`bun.lock`で、既存の`package-lock.json`は変更していない。

Vue 3.5.44の`class`型は再帰的な`ClassValue`になり、既存のTIconハイドレーションテストで、`ref`と`h`を組み合わせた型推論およびDOMの文字列との比較が型エラーになった。テスト用データの`class`を実際に検証する文字列に絞り、公開propsの宣言とコンポーネント実装は維持した。

## 検証結果

Node.js 22.23.4・Bun 1.4.4を使用した。画像比較はCIと同じ固定Playwright 1.64.1コンテナー（Linux amd64）で実行した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | macOSと固定Playwrightコンテナーで成功。いずれも前後で`bun.lock`のSHA-256が一致。 |
| `bun run check` | 515ファイル、エラー0・警告0。既存のReact `act`非推奨のヒント1件。 |
| `bun test` | 55ファイル、228件成功。Vueの全329図柄×4サイズのSSR、ハイドレーション、複数アプリのIDとクリッピング参照の分離、props更新、StorybookでのVueアプリ再利用と解放を確認。 |
| `bun run build` | 紹介ページ1件の静的出力に成功。前段階のビルドと生成CSSが一致。 |
| `bun run build:storybook` | 静的出力に成功。既存の拡張子なしのimportとチャンクサイズに関する警告あり。 |
| `CI=true VITEST_CHROMIUM_GC_DISK_THRESHOLD_GB=Infinity bun run test:storybook` | 固定PlaywrightコンテナーのChromiumで339ファイル、347件成功。 |
| `bun run test:visual` | Firefox・WebKitの全64件が一致。承認済み基準の生成元は`e020d560061ee00b63fb3ddc97827047f4a81c83`。基準画像は更新していない。 |
| 紹介ページと静的Storybook | Chromiumの1440×900・390×844で表示、Tabフォーカス、ホバー、押下・解除を確認。紹介ページの「基盤」への移動と、VueヘッダーボタンのSpaceキー操作も確認。 |
| Storybookの方式切り替え | 両画面幅でTIconの図柄・色・サイズを設定し、URL再読み込みで復元。Vueでサイズを更新してもクリッピングIDを維持し、Astro・Reactへ切り替えるとVueアプリがアンマウントされることを確認。 |

macOSでのStorybook全件テストは、生成キャッシュ退避の前後ともVitestとChromiumの接続切断で中断した。切断までに実行されたテストのアサーション失敗はなかった。

確認時のスクリーンショットはローカルの`test-results/ui/`に保存した。実Safari・VoiceOver、今回の変更に対するGitHub Actionsは未確認。
