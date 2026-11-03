# Storybook 10.6.5への更新記録

確認日：2026年11月3日（日本時間）。[Issue #95](https://github.com/HikariTakahashi/tokiwagi-ui/issues/95)、[更新計画の段階1](dependency-update-plan.md)に対応する。

## 更新範囲と互換性

`storybook`、`@storybook/addon-a11y`、`@storybook/addon-docs`、`@storybook/addon-vitest`、`@storybook/html-vite`を10.6.0から10.6.5へ揃えた。`bun.lock`では、間接依存の`@storybook/builder-vite`、`@storybook/html`、`@storybook/react-dom-shim`も10.6.5になっている。その他の依存バージョンは維持する。

着手時に[公式リリース](https://github.com/storybookjs/storybook/releases/tag/v10.6.5)とnpm公開メタデータを再確認した。更新先の[Vitestアドオン](https://registry.npmjs.org/@storybook/addon-vitest/10.6.5)はVitest・browser-playwrightの`^4.0.0 || ^5.0.0`、[HTML/Vite](https://registry.npmjs.org/@storybook/html-vite/10.6.5)はViteの5〜8系に対応する。現在のVitest 4.1.12・Vite 8.3.0は範囲内で、段階8のVitest 5への更新を前倒ししない。Chromaticアドオン5.6.0もStorybook 10.6.5を対応範囲に含む。

Node.js 22.16.0・Bun 1.3.9で検証する。実行環境、React・Vue・Astro本体、公開コンポーネントのAPI、SVG原本、トークンは更新しない。READMEとTestingの現在版を更新し、計画表の更新前バージョンは策定時点の記録として保持する。第三者ライセンスの2026年10月24日時点の調査表も履歴として保持する。

## 独自パッチを維持する理由

10.6.5の公式npm配布物と既存パッチを照合した。未パッチの配布物に対して、一時コピーの接続・IPCテストを実行すると6件中4件が失敗した。初期同期、集計中の接続、子通知の重複返送、手動再実行時のブラウザー再作成は、更新先だけでは既存の期待動作を満たさない。

| パッチ | 維持する処理・移植内容 |
| --- | --- |
| `patches/storybook@10.6.5.patch` | Universal Storeの初期同期待ちを1秒から30秒へ、WebSocketの追加猶予を5秒から120秒へ延長する。通知間隔15秒と合わせた135秒の接続監視は維持する。内部チャンクを`chunk-TLEZGMVE.js`・`chunk-DDA64MVW.js`へ追従し、Manager内のもう一つの同一ストア実装にも30秒を適用する。 |
| `patches/@storybook%2Faddon-vitest@10.6.5.patch` | 手動再実行時に前のブラウザーとセッションを破棄する。未実行の初期ランナーと監視モードは再利用する。IPC履歴保存を`buffer: { ipc: false }`で無効にし、子由来のストア通知の返送をWeakSetで抑止する。画面からの要求・親の同期応答・標準出力と標準エラーは維持する。 |

旧アドオンパッチは通常の`patch --dry-run`では適用できるが、Bunは旧行位置で誤適用することを検証中に検出した。両パッチを10.6.5の配布物から正しい行位置で再生成した。導入された両パッケージの全JavaScriptを、配布物へ意図した変更を適用した結果とバイト単位で照合した。

`patchedDependencies`とロックファイルも新しい版・パスへ揃え、旧パッチを削除した。接続テストの内部参照を更新した。既存のIstanbul、単一ワーカー、Linux Chromiumのold-space 256MB、StorybookとVitest子プロセスのold-space 768MiB、ファイル間GCの設定は維持する。

## セキュリティ修正と到達範囲

[GHSA-px85-f4q5-jh77](https://github.com/storybookjs/storybook/security/advisories/GHSA-px85-f4q5-jh77)の10系の修正下限は10.6.2で、10.6.5は修正を含む。開発サーバーのHost・Origin検証と、Vitestの`allowWrite`・`allowExec`の既定無効化を保持する。既存ストーリーにこれらの権限を必要とする処理は見つからず、許可を追加していない。更新版の通常HTTPアクセスは200、不正なHostヘッダーは403になることも確認した。

- 通常の起動スクリプトは引き続き`--host 127.0.0.1`。今回のmacOS検証サーバーも127.0.0.1だけで待ち受ける。
- Dev Containerには`forwardPorts: [4321, 6006]`がある。実行中コンテナーのDocker公開ポート・PortBindingsは空で、ホストの6006番はVS Codeが127.0.0.1に転送していることを確認した。VS Codeの転送先や公開設定が変わる場合は、その到達範囲を改めて確認する。
- CIの通常Storybookジョブは静的ビルドとVitestテストを実行する。画像比較も静的出力を127.0.0.1:6006で配信し、開発サーバーをLANへ公開しない。静的Storybook配信はこのアドバイザリーの影響対象外。
- 一時Linux UI検証ではDocker内部だけ0.0.0.0で待ち受け、VS Codeによるホスト転送は127.0.0.1:6010に限定されていることを確認した。一時設定で`core.allowedHosts`を127.0.0.1・localhostに限定し、Host検証を無効化しない。この設定はリポジトリに導入しない。

## 検証結果

以下は更新後の実行結果。画像比較の既存基準は更新していない。

| 検証 | 結果 |
| --- | --- |
| `bun install --frozen-lockfile` | macOS、空のLinux node_modules、実際のDev Containerの作業ディレクトリで成功。新しい両パッチも再現。 |
| `bun run check` | 成功。515ファイル、エラー0・警告0・ヒント1（既存のReact test-utilsのact非推奨）。 |
| `bun test` | 成功。55ファイル、228件成功、0件失敗。接続・IPC・Linuxファイル間GCの回帰テストを含む。 |
| `bun run build` | 成功。Astroの1ページを出力。 |
| `bun run build:storybook` | 成功。Astro実コンポーネント見本を含む静的出力を生成。チャンクサイズ・ビルド時間の案内あり。 |
| `bun run check:react-compat` | 成功。React 18.0.0・18.3.1・19.0.0・19.3.0の公開型・SSR・ハイドレーション・props更新。各31件成功。 |
| `bun run test:storybook` | macOSの作業環境・独立したクリーン環境とLinux amd64で成功。それぞれ339ファイル、347件成功。 |
| `bun run test:storybook --coverage` | Dev Containerの独立した一時コピー（Linux arm64）で成功。339ファイル、347件成功。IstanbulのHTMLレポートを生成。 |
| `bun run test:visual` | 成功。固定Linux amd64 Playwright 1.64.1環境でFirefox・WebKitの64条件が既存基準と一致。基準の生成元は`e020d560061ee00b63fb3ddc97827047f4a81c83`。 |
| Storybook上の手動実行・再実行・Coverage切り替え | Linux arm64でCoverage・a11y付き全347件が成功（約13分20秒）、Coverage 62%のレポートを表示。CoverageをオフにしてTIconを実行し、同じ設定でもう一度実行して、それぞれ1件成功。 |
| Controls・Docs・アクセシビリティ | TIconの図柄・サイズ・色変更、Astro／Vueへの切り替えと再読み込み後の保持、Docs本文、THeaderButtonのa11y違反0件を確認。 |
| デスクトップ・モバイルと操作状態 | Vivaldi（Chromium）で通常表示・実測390×844のモバイル表示、ボタンのホバーとSpace操作、2pxのキーボードフォーカスを確認。 |

既存のmacOS作業環境では137件／234件成功の途中でブラウザー接続が切れた。一方、更新前10.6.0と更新後10.6.5の独立したクリーン環境は、それぞれ347件すべて成功した。作業環境のVite・Storybook生成キャッシュを一時退避した後も347件すべて成功した。依存更新後に同じ切断が起きる場合は、全テストと開発サーバーを停止してから生成キャッシュを退避し、再実行する。途中で切断した実行は成功として数えない。画面からの全件実行後、Coverageオフでの再実行と同じ設定の再実行でChromiumのPIDが75779→79317→79520へ変わり、各回で前のブラウザーが終了することも確認した。Vitest子プロセス自体は同じPIDを維持し、起動時のold-space 768MiBも引き継いでいた。

一時的なLinux amd64エミュレーション環境ではUI用Vitestの起動が30秒の制限を超えたため、UI確認はネイティブLinux arm64で実施した。実Safari・VoiceOverは未検証。WebKitによる画像比較は実Safariの確認を意味しない。
