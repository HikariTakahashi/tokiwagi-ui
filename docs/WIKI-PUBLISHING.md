# Wikiの反映状況と更新手順

## 現在の状態

確認日：2026年10月24日。

- 本体：[https://github.com/HikariTakahashi/tokiwagi-ui](https://github.com/HikariTakahashi/tokiwagi-ui)（Public、既定ブランチ `main`）。公開設定は変更していません。
- GitHub APIの `has_wiki` は `true` です。
- **GitHub Wikiは公開済みです。** Wikiリポジトリの取得に成功し、既定ブランチが `master` であることを確認しました。
- ユーザーが作成した `Home` を保持し、残りの5ページと `_Sidebar.md` をコミット `93bf0ce`（`docs(wiki): 残りの案内ページとサイドバーを公開する`）で公開しました。
- 通常リポジトリの `docs/wiki/` にある7原稿とWiki側の本文を照合済みです。ブラウザで各ページの表示とHome・Sidebarのリンク先を確認しました。

| ページ | ローカル原稿 | GitHub Wiki |
| --- | --- | --- |
| Home | [Home.md](wiki/Home.md) | [公開済み](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Home) |
| Setup | [Setup.md](wiki/Setup.md) | [公開済み](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Setup) |
| Usage | [Usage.md](wiki/Usage.md) | [公開済み](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Usage) |
| Testing | [Testing.md](wiki/Testing.md) | [公開済み](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Testing) |
| Contributing | [Contributing.md](wiki/Contributing.md) | [公開済み](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Contributing) |
| License | [License.md](wiki/License.md) | [公開済み](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/License) |
| Sidebar | [_Sidebar.md](wiki/_Sidebar.md) | [反映済み（Wikiのサイドバー）](https://github.com/HikariTakahashi/tokiwagi-ui/wiki) |

## 取得エラーの原因と解消

初期化前は `git ls-remote https://github.com/HikariTakahashi/tokiwagi-ui.wiki.git` が `Repository not found` となり、未認証のWikiページは通常リポジトリへ転送されていました。

ログイン済みのWiki画面に「Create the first page」が表示されていたため、Wikiが未初期化であることを確認しました。`has_wiki: true` は機能の有効化を示しますが、最初のページの作成は別途必要です。ユーザーによる `Home` の作成・保存後、Wikiリポジトリを取得できるようになり、残りのページも公開できました。

## 初回のみ必要な操作（実施済み）

このWikiは初期化済みです。以下は新しいWikiを初期化する場合の参考手順です。

1. 文書・LICENSE・適用範囲の差分を確認し、外部公開の承認を得ます。ローカルで原稿を作るだけでは公開されません。
2. GitHubに権限のあるアカウントでログインし、[Wiki](https://github.com/HikariTakahashi/tokiwagi-ui/wiki)を開きます。未初期化なら「Create the first page」などの初回作成操作で `Home` を作成します。Markdownの初回原稿は `docs/wiki/Home.md` です。Save Pageはコミット・公開を伴います。
3. 取得エラーが続く場合はWikiの有効化状況・利用アカウント・Git認証・編集権限を確認します。エラーだけを理由に新規Publicリポジトリを作成したり、公開設定を変更したりしません。

GitHub Wikiは本体と別のGitリポジトリです。[GitHub公式の更新手順](https://docs.github.com/en/communities/documenting-your-project-with-wikis/adding-or-editing-wiki-pages)を参照してください。

## 自動同期の導入状況

2026年10月26日、[Issue #53](https://github.com/HikariTakahashi/tokiwagi-ui/issues/53)に対応する自動同期ワークフローと検証を追加しました。上の公開状況は手動反映時点の記録です。自動同期の本番動作は、変更の `main` マージ後に初回Actionsが成功するまで未検証です。ローカルで原稿を保存しただけでは公開されません。

## main反映後の自動公開

`docs/wiki/` を管理対象ページの唯一の編集元とします。Wiki原稿のPRを `main` へマージすることを公開判断とし、GitHub Actionsの **Sync Wiki** がWikiのcommit・pushまで実行します。通常の更新ごとにWiki側のコミット承認を取り直す運用は行いません。本体側でCodexがコミットを作成する際の承認ルールは従来どおりです。

1. 原稿直下の `.md` を編集します。`Home.md` は必須、`_Sidebar.md` も同期対象です。追加・削除・名前変更時はHome・Sidebarや他ページのリンクも更新してください。サブディレクトリやMarkdown以外のファイルは同期しません。
2. PRで本文・削除対象・リンク・ライセンスと公開範囲を確認し、`main` へマージします。同名ページに残したいWiki独自の編集がある場合は、先に原稿へ統合します。
3. 原稿・同期スクリプト・テスト・ワークフローの変更を検知してActionsが起動します。待機中に別の変更が入っても、本体の最新 `main` を取得し、Wikiの既定ブランチへ順番に反映します。本体の `main` とWikiの `master` を同一と仮定しません。
4. 差分がある場合だけ通常のcommit・pushを行い、コミット名とActionsの概要に同期元コミットを記録します。差分がなければ正常終了し、Git履歴を保持します。
5. 初回はActionsの成功に加え、7原稿との一致、Home・Sidebar・README・LICENSEへの遷移、表・コードブロック・見出しの表示を確認してください。公開確認後に本書の導入状況と確認日を更新します。

認証にはGitHub標準の `GITHUB_TOKEN` とジョブの `contents: write` を使用します。個人用トークンや追加Secret、アプリ依存関係のインストールは不要です。同期はBun 1.3.9と標準APIで実行します。

## 管理対象と削除

Wikiリポジトリの `.wiki-sync-manifest` に、同期で管理するページ名をJSON形式で保存します。このファイルはWikiページではありません。手動で削除・編集しないでください。

- 初回は原稿を追加・更新し、管理一覧を登録します。原稿にない既存ページは削除しません。
- 次回以降は「前回の管理一覧にあり、今回の原稿にないページ」だけを削除します。名前変更は旧ページの削除と新ページの追加として反映します。
- 管理一覧にないWiki独自のページ、画像などの添付資産は保持します。後から同名の原稿を追加したページは管理対象になります。
- 管理ページをWiki画面で直接編集した内容は、次回同期時に原稿で上書きされます。変更は原稿へのPRで行ってください。履歴を戻す場合も原稿を修正して再同期します。

## 失敗時の確認と再実行

[Actions](https://github.com/HikariTakahashi/tokiwagi-ui/actions)で **Sync Wiki** を開き、失敗したステップのログを確認します。空の原稿、`Home.md` の欠落、不正な管理一覧、シンボリックリンクなどの不正入力は、ファイルを変更する前に拒否します。

- **認証・権限エラー**：Wikiの有効化と初期化、Actionsの利用制限、`contents: write` が許可されることを確認します。公開設定変更や個人用トークン追加で自動回避しません。
- **push競合**：実行中にWiki側で変更された可能性があります。Wikiの変更を確認し、残す内容は原稿へ取り込み、`main` へ反映してから再実行します。force pushは行いません。
- **原稿・管理一覧エラー**：原稿をPRで修正します。管理一覧が壊れた場合はWikiのGit履歴から直前の正常な一覧を復元してください。安易に一覧を消すと、削除対象の追跡が失われます。

原因を解消したら **Sync Wiki → Run workflow → Branch: main → Run workflow** で最新原稿を再同期します。`main` 以外のブランチを選んだ手動実行はスキップされます。認証・push失敗を成功として扱わず、公開確認は未検証と報告します。

## ローカル検証

同期処理だけならBun 1.3.9とGitで検証でき、ネットワーク接続やアプリの依存インストールは不要です。

```sh
bun test scripts/sync-wiki.test.ts
```

実際の原稿との比較には、作業ツリーがクリーンな独立したWikiチェックアウトを使用します。以下はWikiのファイルを変更して対象差分をステージしますが、commit・pushは実行しません。

```sh
bun scripts/sync-wiki.ts docs/wiki ../tokiwagi-ui.wiki
git -C ../tokiwagi-ui.wiki diff --cached --check
git -C ../tokiwagi-ui.wiki diff --cached
```

ローカルから公開する必要がある場合は、差分・具体的なコミット名を提示して承認後にcommit・pushします。自動公開の検証目的で作業ブランチから直接Wikiへpushしません。
