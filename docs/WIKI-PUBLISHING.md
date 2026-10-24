# Wikiの反映状況と更新手順

## 現在の状態

確認日：2026年10月24日。

- 本体：[https://github.com/HikariTakahashi/tokiwagi-ui](https://github.com/HikariTakahashi/tokiwagi-ui)（Public、既定ブランチ `main`）。公開設定は変更していません。
- GitHub APIの `has_wiki` は `true` です。
- `git ls-remote https://github.com/HikariTakahashi/tokiwagi-ui.wiki.git` は `Repository not found` でした。未認証のWikiページは通常リポジトリへ転送されました。**未初期化の可能性がありますが、アクセスできない原因の断定はしていません。**
- 原稿は通常リポジトリの `docs/wiki/` に準備済みです。**GitHub Wikiには未反映で、既存ページの取得・照合も未完了です。**

| ページ | ローカル原稿 | GitHub Wiki |
| --- | --- | --- |
| Home | [Home.md](wiki/Home.md) | 未反映 |
| Setup | [Setup.md](wiki/Setup.md) | 未反映 |
| Usage | [Usage.md](wiki/Usage.md) | 未反映 |
| Testing | [Testing.md](wiki/Testing.md) | 未反映 |
| Contributing | [Contributing.md](wiki/Contributing.md) | 未反映 |
| License | [License.md](wiki/License.md) | 未反映 |
| Sidebar | [_Sidebar.md](wiki/_Sidebar.md) | 未反映 |

## 初回に必要な操作

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
6. 公開確認後に本書の状態表と確認日を更新し、READMEの「未反映」の案内を公開済みへ更新します。この更新も本体のコミット承認・PR運用に従います。

外部公開を承認されていない間、Wikiの初期化・commit・pushを実施しません。アクセスできない場合は、原稿・失敗理由・必要操作を残し、公開確認は未検証として報告します。
