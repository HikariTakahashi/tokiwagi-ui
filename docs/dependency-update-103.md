# Happy DOM 21.0.4への更新記録

確認日は2026年11月24日（日本時間）。影響評価と前倒しの追跡は #194、更新と回帰検証は #103 で管理する。[Issue #194](https://github.com/HikariTakahashi/tokiwagi-ui/issues/194)・[Issue #103](https://github.com/HikariTakahashi/tokiwagi-ui/issues/103)

## 影響評価と前倒し判断

- GHSA-834v-8h66-3h79は高深刻度で、Happy DOM 17.0.0〜21.0.3に影響する。成立には、Happy DOMでJavaScript評価を明示的に有効化し、信頼できないHTMLまたはモジュール入力を処理することが必要。修正は21.0.4に含まれる。[公式アドバイザリー](https://github.com/capricorn86/happy-dom/security/advisories/GHSA-834v-8h66-3h79)・[21.0.4のリリースノート](https://github.com/capricorn86/happy-dom/releases/tag/v21.0.4)
- 本リポジトリでは、Happy DOMをAstro・React・VueのDOM検証、ハイドレーション、LP・Storybook見本のテストとその補助コードで使う。入力はリポジトリ内のHTMLフィクスチャやコンポーネントの描画結果。`Window`の初期化には既定の設定を使い、URLを指定するテストもJavaScript評価は既定の無効のまま。調査範囲ではアドバイザリーの成立条件を満たす経路は見つからなかった。
- 着手時点の`main`（`4c29be2`）は20.14.5を固定していた。既知の高深刻度の修正を取り込み、テスト用途のまま利用できることを確認するため、段階8のVitest更新に先行してHappy DOMだけを更新する。確認時点で段階8はOpenで、`main`のVitest関連4パッケージは4.1.12だった。[Issue #102](https://github.com/HikariTakahashi/tokiwagi-ui/issues/102)

## 更新と互換性

- `package.json`と`bun.lock`で開発依存を21.0.4に固定した。Bun 1.4.5でロックファイルを生成し、解決版と整合性ハッシュの変更がHappy DOMのみに限られることを確認した。開発環境とCIは`bun.lock`で固定インストールする。[開発環境のセットアップ](wiki/Setup.md)
- 配布パッケージが要求するNode.jsは20.0.0以上で、リポジトリ指定の22.23.4で検証した。21系では外部CSSとiframeの読み込みが既定で無効になる。現行テストはこれらの読み込みを前提とせず、設定や期待値の変更は不要だった。[21.0.0のリリースノート](https://github.com/capricorn86/happy-dom/releases/tag/v21.0.0)・[21.0.4のnpmメタデータ](https://registry.npmjs.org/happy-dom/21.0.4)

## ローカル検証

macOS arm64、Node.js 22.23.4、Bun 1.4.5で実行した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | 21.0.4を導入。再実行の前後で`bun.lock`のSHA-256が一致。 |
| `bun run check` | 721ファイル、エラー0件、警告0件、ヒント7件。 |
| `bun test` | 98ファイル、350件成功。 |
| `bun test src/vue` | 15ファイル、43件成功。VueのDOM操作・SSR・ハイドレーションを含む。 |
| `bun run check:react-compat` | React・React DOM 18.0.0、18.3.1、19.0.0、19.3.1の全4環境で公開型、テスト用の型、SSR、ハイドレーション、props更新を確認。各環境で47件成功。 |
| `bun run build` | Astroの4ページを静的出力。 |
| `bun run build:storybook` | 静的ビルドに成功。チャンクサイズの警告あり。 |

依存取得にはnpmレジストリへの接続が必要だった。接続できる環境で固定インストールとReact互換性検証を再実行し、成功を確認した。変更はテスト用の開発依存と記録で、実ブラウザーでの表示確認と基準画像比較はUI変更時の検証項目。`main`に反映された固定版とGitHub Actionsの実行結果の確認は、マージ後に残る。
