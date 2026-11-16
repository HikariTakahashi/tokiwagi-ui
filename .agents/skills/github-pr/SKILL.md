---
name: github-pr
description: Tokiwagi UI の実装済み変更について、Issue への参照、検証結果、人によるレビューの要点を含む GitHub プルリクエストを作成する。
---

# GitHub プルリクエストの作成

`HikariTakahashi/tokiwagi-ui` の実装がプルリクエストを作成できる状態になり、ユーザーから PR 作成の指示を受けたときに、このスキルを使う。

レビューを依頼する場合は、PR 作成者とは別のアカウントをレビュアーに指定する。

1. リポジトリ、`gh auth status`、ブランチ、作業ツリー、差分を確認する。関係のない変更をコミットやプルリクエストに含めない。作業用ブランチを使い、実装を `main` に直接プッシュしない。
2. `gh issue view ISSUE_NUMBER --repo HikariTakahashi/tokiwagi-ui` で今回の作業を管理する Issue を取得し、URL・状態・完了条件と最終差分を照合する。Issue の検索・作成・更新やラベル操作は [github-issue](../github-issue/SKILL.md) に従い、本体を明示する。対象の Open Issue が未作成・未確定の場合は、その状態と理由を報告して PR 作成を止める。完了済み Issue や背景・参考への参照だけで代替しない。作業中に Issue が閉じられたり変更範囲が広がったりした場合は、[issue-to-pr の手順1](../issue-to-pr/SKILL.md)に戻って対象を見直す。投稿拒否の場合も過去 Issue に付け替えて続行しない。
3. `README.md` に記載された関連するチェックを実行し、結果を確認する。`.github/PULL_REQUEST_TEMPLATE.md` に沿って、対象 Issue、対応した完了条件、残作業、背景・参考、変更内容、検証結果、人によるレビューで確認してほしい点をまとめる。対象 Issue の完了条件をすべて満たす場合に限り `Closes #N` を使う。一部対応の場合は `Refs #N` を使い、残作業を具体的に記す。複数の対象 Issue があれば、それぞれについて対応内容と完了・一部対応を区別する。過去 Issue・PR は「背景・参考」欄へ分け、対象 Issue の代わりにしない。

   UI変更を含む場合はブラウザーで表示と操作を確認する。確認と撮影には、利用可能なブラウザーツール、Playwright、手動操作などを使える。[github-media-attach](../github-media-attach/SKILL.md) に従い、変更箇所と画面の文脈が分かるスクリーンショットを「添付ファイル」欄に添付する。操作の流れを示す必要がある場合は動画も添付する。撮影・添付・添付後の表示確認のいずれかを実施できない場合は、該当項目と理由を PR に記載する。
4. [issue-to-pr の手順5](../issue-to-pr/SKILL.md)に従って承認された変更をコミットし、作業ブランチをプッシュする。PR 作成の直前に手順2の照合を再度行う。本体のブランチからは `gh pr create --repo HikariTakahashi/tokiwagi-ui --base main --body-file ...` で作成する。フォークからは次節に従う。CLI を使う場合、本文には一時的な UTF-8 ファイルを使う。人によるコメントや修正を受けられるよう、作成時にマージしない。
5. プルリクエストの URL、対象 Issue、対応した完了条件と残作業、実施したチェック、人による確認が必要な点を報告する。

## フォークからの PR 作成

自分のフォークを指す Git リモートを確認し、作業ブランチをそのリモートにプッシュする。PR の base は本体 `HikariTakahashi/tokiwagi-ui` の `main`、head はフォークの作業ブランチに指定する。

個人所有のフォークから CLI で作成するときは `--head <所有者>:<ブランチ>` を使う。次の例では `fork` が自分のフォークを指すリモート名、`octocat` がフォーク所有者、`docs/shared-workflow` が作業ブランチ。実際の値に置き換える。

```sh
git push fork docs/shared-workflow
gh pr create --repo HikariTakahashi/tokiwagi-ui --base main \
  --head 'octocat:docs/shared-workflow' --title 'PR のタイトル' \
  --body-file /absolute/path/body.md
```

ブラウザーで作成するときは、GitHub の PR 作成画面でフォーク間の比較を選び、同じ base と head を指定する。
