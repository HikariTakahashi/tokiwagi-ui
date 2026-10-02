# Tokiwagi UI

タスク管理アプリのためのデザインシステムです。Astro は紹介用のランディングページ、Storybook はカラーとアイコンのルール参照・実装時の確認に使います。

## VS Code の拡張機能

VS Code で `tokiwagi-ui` フォルダーを開き、拡張機能ビューで `@recommended` と検索すると、[`.vscode/extensions.json`](.vscode/extensions.json) に登録した拡張機能が表示されます。必要なものを選んでインストールしてください。開発・ビルドに必須の拡張機能はありません。

| 拡張機能 | 用途 |
| --- | --- |
| Astro (`astro-build.astro-vscode`) | `.astro` ファイルの補完・診断 |
| Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`) | Tailwind CSS v4 のクラス補完・検査 |
| MDX (`unifiedjs.vscode-mdx`) | Storybook の `.mdx` 資料の編集 |
| Bun for Visual Studio Code (`oven.bun-vscode`) | Bun のテスト表示・デバッグ |
| CSS Variables (LSP) (`miclmn451.css-variables-vscode`) | カラートークンの補完・定義への移動 |
| GitHub Pull Requests (`GitHub.vscode-pull-request-github`) | Issue・PR の確認とレビュー |

Astro と Tailwind CSS IntelliSense は特に推奨します。CSS Variables (LSP) と GitHub Pull Requests は作業内容に応じて選べます。

## 起動

Bun 1.3.9 以上を使用します。

```sh
cd tokiwagi-ui
bun install --frozen-lockfile
bun run dev:all    # Astro LP: http://localhost:4321 / Storybook: http://localhost:6006
bun run dev        # Astro LP: http://localhost:4321
bun run storybook  # Storybook: http://localhost:6006
```

`bun run dev:all` で2つのサーバーを同時に起動できます。個別に起動する場合は `dev` または `storybook` を使います。LP の Storybook リンクは Storybook サーバーを起動すると開けます。

## 管理元

- カラー値は `tokens/colors.css`、`tokens/secondary.css`、`tokens/semantic.css`、`tokens/neutrals.css` の全93トークンが定義元です。Storybook の見本・HEX・コントラスト表示はこれらを読み込みます。
- カラーの使用ルールと操作例は Storybook の「カラー」にあります。CSS を編集して保存すると開発中の表示に反映されます。
- アイコンの公開名は Storybook の「アイコン/命名基準」と「アイコン/アイコン名および用途」（一覧）で管理します。一覧から全329アイコンの「個別ルール」へ移動できます。各ページは概要・使用場面・状態の表し方・使用しない場面・表示とアクセシビリティ・関連アイコンと使い分けの6セクションです。`bell` のルールは確定済み、ほかは詳細ルール案です。既存アプリの参照 ID は「アイコン/既存フロントエンドとの対応」に保持しています。SVG 図形は `icons/` に329個収録済みです。一覧で検索・分類・サイズ・色を切り替え、個別ページで4サイズの見本、公開名コピー、原本SVGのダウンロードを利用できます。
- Tailwind CSS v4 の共有テーマは `tokens/tailwind.css` です。

## 検証と静的ビルド

```sh
bun test
bun run check
bun run build
bun run build:storybook
```

Astro の出力は `dist/`、Storybook の出力は `storybook-static/` です。外部公開、既存 Nuxt アプリへの組み込み、Vue・React・Astro の実コンポーネント実装はこの構成に含みません。これらのコンポーネントを作る段階で各方式の Storybook を追加します。

## GitHub での開発

このディレクトリは [HikariTakahashi/tokiwagi-ui](https://github.com/HikariTakahashi/tokiwagi-ui) で独立して管理します。Git と GitHub CLI (`gh`) を用意し、`gh auth login -h github.com` で認証してください。Git コマンドはこのディレクトリで実行します。

1. 作業前に [Issue](https://github.com/HikariTakahashi/tokiwagi-ui/issues) を検索します。未登録の作業は「新規実装」「不具合修正」「残タスク」から種類を選び、各テンプレートの項目に沿って Issue にします。残タスクは範囲が確定したものを追跡し、未着手の構想は必要になった時点で登録します。
2. `main` から作業ブランチを作り、関連 Issue の範囲で実装します。例: `git switch main && git pull --ff-only && git switch -c feat/123-icon-svg`。
3. 変更を確認し、該当する検証を実行してからコミット・push します。PR には関連 Issue、変更内容、検証結果、レビューで見てほしい点を記載します。Issue の完了条件をすべて満たす場合だけ `Closes #123` を使います。
4. PR 上のコメントで人間の確認内容と修正結果を記録します。確認後にマージし、Issue の状態を更新します。`main` への変更は PR 経由とし、承認必須の設定は設けません。

Issue の記載項目は `.github/ISSUE_TEMPLATE/` 内の3種類のテンプレート、PR の記載項目は `.github/PULL_REQUEST_TEMPLATE.md` にあります。Codex からは、一連の作業に `$issue-to-pr`、Issue 登録に `$github-issue`、コミット作成に `$conventional-commit`、PR 作成に `$github-pr` を指定できます。これらのリポジトリ用 skill は `.agents/skills/` にあります。

## アイコン原本の追加・差し替え

- 図形の唯一の編集元は `icons/<公開名>.svg` です。Downloads フォルダーには依存しません。原本は32×32の `viewBox` と制作時の座標・線幅・縦横比を保持します。
- 差し替えは同名の原本を更新します。新規追加時は命名基準に従い、`src/stories/icons/` に6セクションと `IconPreview` を持つ個別ページを追加します。名前・分類・一覧は原本から自動的に読み込みます。件数の受け入れ条件と文書も更新してください。
- `src/lib/icon-assets.ts` が表示時に黒い線と塗りを `currentColor` に変換します。`fill="none"` とクリッピング用の白い塗りを保持し、ID参照は表示ごとに一意にします。表示用SVGを別途編集しません。
- 原本ダウンロードはStorybookの `staticDirs` で `icons/` を配信します。静的ビルドにも原本がそのままコピーされ、サブディレクトリへの配置でも相対URLで参照できます。
- 共通の資料用UIは `src/stories/components/IconBrowser.tsx` にあります。ReactはStorybookのMDX資料用で、アプリ向けコンポーネントAPIではありません。
- `bun test`、`bun run check`、`bun run build`、`bun run build:storybook` を実行します。一覧・個別ページで原本との一致、16/20/24/32pxの判読性、トークン色、同一図柄の複数表示、キーボード操作とモバイル表示を確認してください。
- 小サイズで細部が判別しにくい図柄はサイズを上げるかラベルを併記します。全アイコンの16px利用を一律に推奨しません。詳しくはStorybookの「アイコン/共通表示ルール」を参照してください。
