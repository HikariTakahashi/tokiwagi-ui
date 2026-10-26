# 環境構築・開発環境

## 前提

- Bun **1.3.9**（`packageManager` の指定）。既存の開発方針は1.3.9以上ですが、まず指定版でそろえてください。
- Node.js **22.12.0以上**。インストール済みAstroとAstroコンパイラの `engines.node` に基づきます。StorybookなどNode.jsを使用するツールのために用意します。
- Git。GitHub上でIssue・PRを操作する開発者はGitHub CLIも用意します。
- React・Vueは使う入口に対応するものを利用側へ導入します。開発リポジトリには見本・テスト用の依存が含まれています。

## リポジトリの取得

```sh
git clone https://github.com/HikariTakahashi/tokiwagi-ui.git
cd tokiwagi-ui
```

## 依存関係

```sh
bun install --frozen-lockfile
```

`bun.lock` を基準にします。既存の `package-lock.json` は今回変更しません。開発時はBunを使い、インストールのためだけにロックファイルを更新しないでください。

## 環境変数

現在のソース・設定には、起動に必要なアプリ用環境変数や `.env` の指定はありません。バックエンドや認証用の設定は不要です。`.env`・`.env.*` はGitの除外対象で、`.env.example` のみ例外です。将来必要になった場合はダミー値で例示し、秘密情報をコミットしないでください。

## 開発サーバー

取得・依存導入済みの `tokiwagi-ui` ディレクトリで実行します。

```sh
bun run dev:all    # Astro LP: http://localhost:4321 / Storybook: http://localhost:6006
bun run dev        # Astro LP: http://localhost:4321
bun run storybook  # Storybook: http://localhost:6006
```

`bun run dev:all` で2つのサーバーを同時に起動できます。個別に起動する場合は `dev` または `storybook` を使います。LP の Storybook リンクは Storybook サーバーを起動すると開けます。


## 静的ビルドとプレビュー

```sh
bun run build            # dist/
bun run preview          # Astroビルドのプレビュー。URLは起動ログを参照
bun run build:storybook  # storybook-static/
```

LPのStorybookリンクは現在 `http://localhost:6006/` を指します。静的出力を作ることと外部へホスティングすることは別です。外部公開先は未設定で、今回の文書整備では配信設定を変更しません。作業前に停止していたサーバーを検証用に起動した場合は、確認後に停止してください。

## ディレクトリ構成

| パス | 内容 |
| --- | --- |
| `src/react/`・`src/vue/`・`src/astro/` | フレームワーク別の実装・入口・テスト |
| `src/lib/` | SVG変換・カタログ・トークン解析などの共通処理 |
| `icons/<公開名>/` | 汎用SVG原本・使用ルール。`icons/logo/` はMIT対象外 |
| `components/` | 部品ごとの利用ルール原本 |
| `tokens/` | カラー値・Tailwindテーマの管理元 |
| `src/pages/`・`src/styles/` | 紹介LP・共有スタイル |
| `src/stories/`・`src/icons/`・`.storybook/` | Storybook見本・資料・設定 |
| `scripts/` | アイコン生成・互換性検証・Astro見本描画 |
| `.github/`・`.agents/` | チーム開発テンプレート・エージェント用スキル |
| `docs/wiki/` | GitHub Wiki用Markdown原稿（PRのmainマージ後にActionsで自動同期） |

## VS Code の拡張機能

VS Code で `tokiwagi-ui` フォルダーを開き、拡張機能ビューで `@recommended` と検索すると、[`.vscode/extensions.json`](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/.vscode/extensions.json) に登録した拡張機能が表示されます。必要なものを選んでインストールしてください。開発・ビルドに必須の拡張機能はありません。

| 拡張機能 | 用途 |
| --- | --- |
| Astro (`astro-build.astro-vscode`) | `.astro` ファイルの補完・診断 |
| Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`) | Tailwind CSS v4 のクラス補完・検査 |
| MDX (`unifiedjs.vscode-mdx`) | Storybook の `.mdx` 資料の編集 |
| Bun for Visual Studio Code (`oven.bun-vscode`) | Bun のテスト表示・デバッグ |
| CSS Variables (LSP) (`miclmn451.css-variables-vscode`) | カラートークンの補完・定義への移動 |
| GitHub Pull Requests (`GitHub.vscode-pull-request-github`) | Issue・PR の確認とレビュー |

Astro と Tailwind CSS IntelliSense は特に推奨します。CSS Variables (LSP) と GitHub Pull Requests は作業内容に応じて選べます。
