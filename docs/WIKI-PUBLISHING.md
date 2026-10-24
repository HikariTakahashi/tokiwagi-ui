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

## 初期化後の反映

以下は承認後に実施する手順です。例では本体とWikiを同じ親ディレクトリに配置します。既存のWikiチェックアウトがあれば再利用し、無関係な変更を残してください。

```sh
git clone https://github.com/HikariTakahashi/tokiwagi-ui.wiki.git ../tokiwagi-ui.wiki
git -C ../tokiwagi-ui.wiki status --short
git -C ../tokiwagi-ui.wiki ls-files
git -C ../tokiwagi-ui.wiki remote show origin
```

まず既存ページ・履歴・既定ブランチを確認します。同名ページは差分を比較して必要な既存内容を統合し、原稿の一括コピーで上書きしません。新しいファイルだけを追加し、別名で同じ内容のページがある場合は重複を解消してSidebarを合わせます。画像など既存の添付資産も保持します。

1. 本体側の文書変更をPR経由で `main` へ反映し、WikiからリンクするLICENSE・適用範囲・参照資料が閲覧できることを確認します。
2. 7原稿をWiki側へ手動で統合します。ファイル名は `Home.md`・`Setup.md`・`Usage.md`・`Testing.md`・`Contributing.md`・`License.md`・`_Sidebar.md` とします。
3. `git -C ../tokiwagi-ui.wiki diff --check` と差分レビューを行い、対象ファイルとコミット名を提示してコミットの承認を得ます。本体側の承認がWiki側のコミットも含むかを明確にします。
4. 対象の7ファイルのみをstageし、承認された名前でcommitします。`remote show origin` で確認したWikiの既定ブランチへ、承認後にpushします。ブランチ名を本体の `main` と同じと仮定しません。
5. [Home](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Home)から各ページ、Sidebarから全ページ、READMEからWiki、WikiからLICENSE・参照資料への遷移を確認します。Markdownの表・コードブロック・見出しの表示も確認します。
6. 公開確認後に本書の状態表と確認日を更新し、READMEの案内を最新の公開状況に合わせます。この更新も本体のコミット承認・PR運用に従います。

外部公開を承認されていない間、Wikiの初期化・commit・pushを実施しません。アクセスできない場合は、原稿・失敗理由・必要操作を残し、公開確認は未検証として報告します。
