---
name: github-pr
description: Tokiwagi UI の実装済み変更について、Issue への参照、検証結果、人によるレビューの要点を含む GitHub プルリクエストを作成する。
---

# GitHub プルリクエストの作成

`HikariTakahashi/tokiwagi-ui` の実装がプルリクエストを作成できる状態になったときに、このスキルを使う。

1. リポジトリ、`gh auth status`、ブランチ、作業ツリー、差分を確認する。関係のない変更をコミットやプルリクエストに含めない。作業用ブランチを使い、実装を `main` に直接プッシュしない。
2. `README.md` に記載された関連するチェックを実行し、結果を確認する。`.github/PULL_REQUEST_TEMPLATE.md` に沿って、変更内容、関連 Issue、検証結果、人によるレビューで確認してほしい点をまとめる。Issue の完了条件をすべて満たす場合に限り `Closes #N` を使い、それ以外は `Refs #N` を使う。
3. 対象の変更をコミットしてプッシュし、`gh pr create --repo HikariTakahashi/tokiwagi-ui --base main --body-file ...` でプルリクエストを作成する。本文には一時的な UTF-8 ファイルを使う。人によるコメントや修正を受けられるよう、作成時にマージしない。
4. プルリクエストの URL、実施したチェック、人による確認が必要な点を報告する。作成者が `HikariTakahashi` の場合、同じアカウントを正式なレビュアーとして指定しない。GitHub は自己承認を承認として扱わない。
