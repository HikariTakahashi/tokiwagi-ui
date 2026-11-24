# Bunと型定義の1.4.5への更新記録

確認日は2026年11月24日（日本時間）。[Issue #193](https://github.com/HikariTakahashi/tokiwagi-ui/issues/193)に対応する。[前回の更新](dependency-update-97.md)でBunと型定義を1.4.4に揃えた。

## セキュリティと互換性

- GHSA-p268-p2w7-qr8xはBun 1.3.14以上1.4.5未満に影響し、1.4.5に同梱のLSQUIC 4.11.2で修正される。サーバー側の影響条件はHTTP/3の有効化または`node:quic`の利用。BunのHTTP/3は既定で無効で、明示的にHTTP/3を選んだ`fetch`については公式アドバイザリーが影響ありとして扱うよう案内している。[Bun公式アドバイザリー](https://github.com/oven-sh/bun/security/advisories/GHSA-p268-p2w7-qr8x)
- 本リポジトリのコードと設定を確認した。AstroとStorybookの開発サーバーは`127.0.0.1`で動作し、HTTP/3の有効化、`node:quic`の利用、BunのHTTP/3クライアントの指定、`bun build --compile`による実行ファイル生成は見つからなかった。CIの補助スクリプトではGitHub APIへのHTTPSリクエストに`fetch`を使うため、開発・CI用ランタイムを更新してTLS・DNSの修正も取り込む。[Bun 1.4.5のリリースノート](https://bun.com/blog/bun-v1.4.5)
- 1.4.5では一部の古いカスタムルート証明書が拒否されるようになり、SQLiteで一部の予約列名を対象とする`ALTER TABLE`の動作が変わる。リポジトリのコード・設定にカスタムルート証明書や`bun:sqlite`の直接利用は見つからなかった。[Bun 1.4.5のリリースノート](https://bun.com/blog/bun-v1.4.5)

## 更新範囲

- `packageManager`、9ワークフローのBun導入18箇所、Dev Containerの`oven/bun`イメージ、開発・テスト・Wiki同期手順の現行版を1.4.5に揃えた。CIのStorybookジョブはnpm経由で導入する。
- Bun 1.4.5で`bun add --dev --exact --lockfile-only @types/bun@1.4.5`を実行した。`bun.lock`のパッケージ差分は`@types/bun`と、その依存の`bun-types`の2件。両方とも1.4.5に解決された。`bun-types`の依存先は既存の`@types/node` 26.6.2と`undici-types` 8.9.0で解決される。[npmの@types/bunメタデータ](https://registry.npmjs.org/@types/bun/1.4.5)、[npmのbun-typesメタデータ](https://registry.npmjs.org/bun-types/1.4.5)

## 検証結果

macOS arm64、現行設定から新規構築したDev Container（Ubuntu 24.04、Linux arm64）、CIと同じ固定Playwrightイメージ（Linux amd64）で、Node.js 22.23.4、Bun 1.4.5、`@types/bun` 1.4.5、`bun-types` 1.4.5を確認した。PlaywrightイメージではCIのStorybookジョブと同じnpmコマンドでBunを導入した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | 3環境で成功。実行前後で`bun.lock`のSHA-256が一致。 |
| `bun run check` | macOSとDev Containerで721ファイル。エラー0、警告0、ヒント7件。 |
| `bun test` | macOSとDev Containerで98ファイル、350件成功。 |
| `bun run build` | macOSとDev ContainerでAstroの4ページを静的出力。 |
| `bun run build:storybook` | 3環境で静的ビルドに成功し、Astroの実コンポーネント見本JSONを12件出力。拡張子なしのimportとチャンクサイズの警告あり。 |
| `bun run test:storybook` | CIと同じPlaywrightイメージのChromiumで358ファイル、366件成功。 |
| ワークフローの静的確認 | Bun導入18箇所の固定版を`packageManager`と照合。変更判定で6件の必須チェックが選ばれることを確認。 |

GitHub Actions上の実行版と各ジョブの結果は未確認。ローカルではReact 18/19の互換性チェックとFirefox・WebKitの基準画像比較は未実施。Wiki公開結果はマージとSync Wikiの実行後に確認する。
