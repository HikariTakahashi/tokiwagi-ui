# Tokiwagi UI

タスク管理アプリのためのデザインシステムです。Astro は紹介用のランディングページ、Storybook はカラーとアイコン案のルール参照・実装時の確認に使います。

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
- アイコンの公開名、用途、既存アプリの参照 ID は Storybook の「アイコン/命名と用途の案」で管理します。図形は未制作です。
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
