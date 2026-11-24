# Astro 7.4.13とVite 8.3.8への更新記録

確認日は2026年11月24日（日本時間）。[Issue #192](https://github.com/HikariTakahashi/tokiwagi-ui/issues/192)に対応する。[前回の更新記録](dependency-update-98.md)ではAstro 7.4.5、Vite 8.3.5を採用していた。

## 更新内容と動作要件

- Astroを7.4.13に更新した。Node.jsの要件は`>=22.23.4`で、CI・Dev Containerの22.23.4で満たす。[Astro 7.4.13の公開メタデータ](https://registry.npmjs.org/astro/7.4.13)
- テストとStorybook用のAstro見本生成が直接使う`@astrojs/compiler-rs`を0.5.3に揃えた。Astroの要求は`^0.5.3`、コンパイラー自身のNode.js要件は`>=22.12.0`。[Astro Compiler RS 0.5.3の公開メタデータ](https://registry.npmjs.org/@astrojs/compiler-rs/0.5.3)
- ネットワークに公開した開発サーバーでは、Vite 8.3.0〜8.3.6が脆弱性の影響を受ける。8.3.7で修正され、今回の更新では修正を含む8.3.8を全経路で解決して`bun.lock`に固定した。Viteは間接依存のまま利用する。[Vite公式アドバイザリー](https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7)

### 依存経路ごとの解決結果

固定インストール後、`bun.lock`に記録されたViteとRolldownの依存元それぞれから実際のパッケージを解決し、要求範囲との一致を確認した。Vite 8.3.8とRolldown 1.2.19・1.3.3が要求するNode.jsはすべて`^20.19.0 || >=22.12.0`で、22.23.4が要件を満たす。[Vite 8.3.8](https://registry.npmjs.org/vite/8.3.8)、[Rolldown 1.2.19](https://registry.npmjs.org/rolldown/1.2.19)、[Rolldown 1.3.3](https://registry.npmjs.org/rolldown/1.3.3)

| 依存元 | 依存先 | 要求範囲 | 解決版 |
| --- | --- | --- | --- |
| Astro | Vite | `^8.3.8` | 8.3.8 |
| `@astrojs/vite-plugin-astro` | Vite | `^8.3.3` | 8.3.8 |
| `@storybook/html-vite`、`@storybook/builder-vite` | Vite | `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0` | 8.3.8 |
| `@tailwindcss/vite` | Vite | `^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8` | 8.3.8 |
| Vitest、`@vitest/mocker` | Vite | `^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0` | 8.3.8 |
| `vitefu` | Vite | `^3.0.0 \|\| ^4.0.0 \|\| ^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0` | 8.3.8 |
| Astro | Rolldown | `~1.3.2` | 1.3.3 |
| `@astrojs/vite-plugin-astro` | Rolldown | `~1.2.16` | 1.2.19 |
| Vite | Rolldown | `~1.2.18` | 1.2.19 |

## 開発サーバーとポート転送

`astro.config.mjs`は`127.0.0.1:4321`、`package.json`のStorybook起動コマンドは`127.0.0.1:6006`を指定する。現行設定から一時Dev Containerを新規構築し、`bun run dev:all`で両ポートのIPv4ループバック待受とHTTP 200を確認した。コンテナーの非ループバックIPv4アドレスでは両ポートへのHTTP接続が失敗した。Dockerの`PortBindings`と`NetworkSettings.Ports`はともに空だった。

Dev Containerの`forwardPorts`は4321と6006を指定し、`requireLocalPort`でホスト側も同じポート番号を使う。VS Codeの`remote.localPortHost`の既定値は`localhost`。[VS Codeのポート転送ドキュメント](https://code.visualstudio.com/docs/devcontainers/containers#_forwarding-or-publishing-a-port)

今回起動したDev Container CLIではVS Codeの転送セッションを作成していないため、エディター経由のホスト側待受とLAN上の別端末からの到達性は未実測。

## 検証結果

macOS、Dev Container、CIと同じLinux amd64のPlaywrightコンテナーでNode.js 22.23.4・Bun 1.4.4を使用した。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | macOS、Dev Container、Playwrightコンテナーで成功。macOSで新規インストール前後のロックファイルのSHA-256が一致。 |
| `bun run check` | 721ファイル。エラー0、警告0、ヒント7件。 |
| `bun test` | 98ファイル、350件成功。Astro実コンポーネントの描画と全336図柄×4サイズの形状・着色を確認。 |
| `bun run build` | 紹介ページの4ルートを静的出力。 |
| `bun run build:storybook` | 静的出力に12種類のAstro実コンポーネント見本JSONを収録。拡張子なしのimport、チャンクサイズ、プラグイン処理時間の警告あり。 |
| `CI=true bun run test:storybook` | Chromiumで358ファイル、366件成功。 |
| `bun run test:visual` | Playwright 1.64.1のFirefox・WebKitで64件すべて承認済み基準画像と一致。基準の生成元は`e020d560061ee00b63fb3ddc97827047f4a81c83`。 |
| Chromiumの画面確認 | 1440×900と390×844でLPの4ルート、アイコン検索、チェックボックス操作、StorybookのDocsを確認。Astro版TIconのJSON取得失敗からの再試行と32px表示、TButtonのTabフォーカス・ホバー・押下・解除、TCheckboxの切り替えを確認。 |

実Safari・VoiceOver、GitHub Actionsの実行、Wiki公開は未確認。
