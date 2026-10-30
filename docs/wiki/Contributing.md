# 開発担当者・開発参加方法

## 開発担当者

GitHubのContributorsで確認できた開発者は [HikariTakahashi](https://github.com/HikariTakahashi) です。Git履歴には `Hikari Takahashi`・`HikariTakahashi` の表記があります。著作権表示名は権利者の確認に基づき **Hikari Takahashi** とします。

担当領域・追加メンバー・正式なレビュー担当者は **TODO：未確認** です。履歴のコミット数だけで担当領域を決定しません。

## 参加方法とブランチ運用

このディレクトリは [HikariTakahashi/tokiwagi-ui](https://github.com/HikariTakahashi/tokiwagi-ui) で独立して管理します。Git と GitHub CLI (`gh`) を用意し、`gh auth login -h github.com` で認証してください。Git コマンドはこのディレクトリで実行します。

1. 作業前に [Issue](https://github.com/HikariTakahashi/tokiwagi-ui/issues) を検索します。未登録の作業は「新規実装」「不具合修正」「残タスク」から種類を選び、各テンプレートの項目に沿って Issue にします。残タスクは範囲が確定したものを追跡し、未着手の構想は必要になった時点で登録します。
2. `main` から作業ブランチを作り、関連 Issue の範囲で実装します。例: `git switch main && git pull --ff-only && git switch -c feat/123-icon-svg`。
3. 変更を確認し、該当する検証を実行してからコミット・push します。PR には関連 Issue、変更内容、検証結果、レビューで見てほしい点を記載します。Issue の完了条件をすべて満たす場合だけ `Closes #123` を使います。
4. PR 上のコメントで人間の確認内容と修正結果を記録します。確認後にマージし、Issue の状態を更新します。`main` への変更は PR 経由とし、承認必須の設定は設けません。

Issue の記載項目は `.github/ISSUE_TEMPLATE/` 内の3種類のテンプレート、PR の記載項目は `.github/PULL_REQUEST_TEMPLATE.md` にあります。Codex からは、一連の作業に `$issue-to-pr`、Issue 登録に `$github-issue`、コミット作成に `$conventional-commit`、PR 作成に `$github-pr` を指定できます。これらのリポジトリ用 skill は `.agents/skills/` にあります。


## Issue・コミット・レビュー

- Issueは既存の重複を検索し、「新規実装」「不具合修正」「残タスク」のテンプレートを使います。種別と重要度のラベルを1つずつ付けます。
- コミット名は既存のConventional Commits形式に従います。例：`docs(wiki): セットアップ手順を整理する`。
- Codexによるコミットは、対象ファイル・具体的なコミット名を提示し、ユーザーの明示的な許可を得てから実行します。PRは作成を指示された場合のみ作成します。
- レビューはIssueの完了条件、変更範囲、検証結果を基準に行い、確認内容と修正結果をPRコメントに残します。
- 既存文書は「mainへの変更はPR経由、承認必須設定は設けない」としています。GitHubの保護ルール設定そのものは今回変更・再監査していません。
- 公開対象の追加、ブランド利用許諾、外部公開は実装・資料の追加とは区別して確認します。

## 資料の編集

READMEは概要と導線、Wikiは導入・利用・テスト・開発運用を扱います。Wikiの管理ページは `docs/wiki/` だけで編集し、原稿のPRの `main` マージを公開判断とします。GitHub Actionsの **Sync Wiki** が追加・更新・管理対象ページの削除を自動反映するため、通常更新でWiki側の承認を取り直す必要はありません。Wiki独自のページや画像は保持しますが、管理ページの直接編集は次回同期で上書きされます。ページ追加・削除・名前変更時はHome・Sidebarなどのリンクも合わせて更新してください。失敗の確認と手動再実行は[Wiki更新手順](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/docs/WIKI-PUBLISHING.md)を参照してください。

コンポーネント・アイコンの個別ルール原本、Storybookとの役割分担、ブランドの権利範囲を維持してください。

## アイコン原本の追加・差し替え

- 図形の唯一の編集元は `icons/<公開名>/<公開名>.svg` です。Downloads フォルダーには依存しません。原本は32×32の `viewBox` と制作時の座標・線幅・縦横比を保持します。
- 差し替えは同名の原本を更新します。用途・使用ルール・別名は同じディレクトリの `README.md` に記載します。新規追加時は命名基準に従い、SVG、6セクションを持つ README、README を読み込む `src/icons/<公開名>.mdx` の個別ページを一組で追加します。名前・分類・一覧は原本から、検索用の別名は README から自動的に読み込みます。件数の受け入れ条件と文書も更新してください。
- `src/lib/icon-assets.ts` が表示時に黒い線と塗りを `currentColor` に変換します。`fill="none"` とクリッピング用の白い塗りを保持し、ID参照は表示ごとに一意にします。表示用SVGを別途編集しません。
- 原本ダウンロードはStorybookの `staticDirs` で `icons/` を `/icon-assets` に配信します。README の `?raw` 読み込みと静的配信のURLを分けています。静的ビルドにも原本がそのままコピーされ、サブディレクトリへの配置でも相対URLで参照できます。
- 共通の資料用UIは `src/stories/components/IconBrowser.tsx` にあります。このコンポーネントはStorybookのMDX資料用です。アプリ向けAPIには `tokiwagi-ui/react`・`tokiwagi-ui/vue`・`tokiwagi-ui/astro` の `TIcon` を使います。
- Vue・React・Astro共通の公開名と原本へのimportは `bun run generate:icons` で `src/lib/icon-sources.ts` に生成します。Vueの既存ファイルは共通データを再exportします。同じコマンドで `src/stories/icon-examples/*.stories.ts` の使用例も原本カタログから生成します。新規追加・削除時に実行してください。SVG本体を複製せず、同名原本の差し替えは自動反映します。原本と生成ファイルの不一致はテストで検出します。
- `bun test`、`bun run check`、`bun run build`、`bun run build:storybook` を実行します。一覧・使用例で原本との一致、16/20/24/32pxの判読性、トークン色、同一図柄の複数表示、キーボード操作とモバイル表示を確認してください。
- 代表図柄や描画処理を変更した場合は、[テスト方法](Testing)の画像比較手順に従い、固定Linux環境で `bun run test:visual` も実行します。基準画像の変更は見た目を確認してからPRに含めます。
- 小サイズで細部が判別しにくい図柄はサイズを上げるかラベルを併記します。全アイコンの16px利用を一律に推奨しません。詳しくはStorybookの「アイコン/共通表示ルール」を参照してください。
