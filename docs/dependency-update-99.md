# React・React DOMの更新記録

確認日：2026年11月16日（日本時間）。[Issue #99](https://github.com/HikariTakahashi/tokiwagi-ui/issues/99)、[更新計画の段階5](dependency-update-plan.md)に対応する。前提のAstro関連・Vite更新は[PR #113](https://github.com/HikariTakahashi/tokiwagi-ui/pull/113)でmainへマージ済み。

## 採用したバージョンと変更範囲

開発依存の`react`・`react-dom`を19.3.0から19.3.1へ更新した。着手時にnpm公式レジストリの[React 19.3.1](https://registry.npmjs.org/react/19.3.1)・[React DOM 19.3.1](https://registry.npmjs.org/react-dom/19.3.1)の公開と、両者の`latest`が19.3.1であることを確認した。React DOMのpeer dependencyはReact `^19.3.1`で、同じ版の組み合わせは要件を満たす。

`bun.lock`の変更はReact・React DOMの指定、解決版、整合性ハッシュとReact DOMのpeer要件のみ。間接依存の追加・削除・バージョン変更はなく、`scheduler`は既存の解決版を維持した。`@types/react`・`@types/react-dom`は19.3.0、利用側のReact対応範囲は`^18.0.0 || ^19.0.0`を維持する。公開API・コンポーネント実装・互換性チェックスクリプトの変更は不要だった。

## 検証結果

macOSでNode.js 22.23.4・Bun 1.4.4を使用した。画像比較はCIと同じ固定Playwright 1.64.1コンテナー（Linux amd64）で実行した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | macOSと固定Playwrightコンテナーで成功。macOSでは前後のロックファイルのSHA-256が一致。 |
| `bun run check` | 515ファイル、エラー0・警告0。既存のReact `act` 非推奨のヒント1件。 |
| `bun test` | 55ファイル、228件成功。 |
| `bun run check:react-compat` | React・React DOM 18.0.0、18.3.1、19.0.0、19.3.1の全4環境で公開型・テスト用APIの型検査と各31件のテストが成功。 |
| `bun run build` | 紹介ページ1件を出力。 |
| `bun run build:storybook` | 成功。既存の拡張子なしimportとチャンクサイズに関する警告あり。 |
| `CI=true bun run test:storybook` | Chromiumで339ファイル、347件成功。 |
| `bun run test:visual` | Firefox・WebKitの全64件成功。承認済み基準の生成元は`e020d560061ee00b63fb3ddc97827047f4a81c83`で、基準画像は更新していない。 |
| 紹介ページ・静的Storybookの操作 | Chromiumの1440×900・390×844で表示とTabフォーカス、ホバー、押下、押下解除、紹介ページのアンカー移動、Reactヘッダーボタンのキーボード操作を確認。 |
| Storybook Controls | TIconの図柄・サイズ・色変更、URL再読み込み、React→Vue→Astro→Reactの切り替えで設定を保持。moonのクリッピング参照も確認。モバイルでは標準アドオンパネルから操作。 |

互換性検証では全329アイコン×4サイズのSSR、ハイドレーション、ID分離、props更新、ヘッダー操作、TTextとブランド表示を確認した。型定義の組み合わせと結果は[Wiki原稿の検証表](wiki/Testing.md#react互換性の検証結果)に記録する。固定インストール前後と互換性チェック後の`bun.lock`のSHA-256は`f5fc82c8855db860c4a0ab98dcfcd92de80b8dfba808625f675a845e6cacf9a8`で一致した。

紹介ページの主リンク「Storybook で見る」の文字色と背景色が同じになる事象は[段階4で記録済み](dependency-update-98.md)で、今回も確認した。更新前後の紹介ページの生成CSSはバイト単位で一致した。これは今回のReact更新による差分ではない。

実Safari・VoiceOver、今回の変更に対するGitHub Actions、Wiki公開は未確認。ブラウザー確認のスクリーンショットはローカルの`test-results/ui/`に保存し、Gitには含めない。
