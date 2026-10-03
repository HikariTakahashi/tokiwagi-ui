---
name: github-media-attach
description: Tokiwagi UIのUI変更を示すスクリーンショットや動画を、GitHub CLIでPR・Issue・コメントへ添付し、表示を確認する場合に使用する。
---

# スクリーンショット・動画のGitHub添付

対象は `HikariTakahashi/tokiwagi-ui`。画面の撮影とGitHubへの添付を分けて扱い、添付には公式GitHub CLIの `--attach` を優先する。PR作成には [github-pr](../github-pr/SKILL.md) を併用する。添付の依頼だけで新規PR・Issue、コミット、pushを行わない。

## 素材とCLIの確認

- UI変更はComputer Useで実画面を確認・撮影する。変更箇所と画面の文脈が分かるスクリーンショットを選び、操作の流れを示す必要がある場合は動画も使う。動画は利用可能な録画機能で撮影したものか提供済みのファイルを使い、録画APIがあると推測しない。
- 保存先は一時ディレクトリを使い、画像・動画をリポジトリへコミットしない。添付前に画像を目視、動画を再生して内容を確認する。
- 画像はPNG・JPEG・GIFなど、動画はMP4・MOV・WebMに対応。動画の互換性にはMP4/H.264を優先する。画像・GIFは10MB、動画は無料プラン10MB・有料プラン100MBが上限。プランが不明なら10MB以内を目安とし、必要なら[公式の形式・容量制限](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files)を確認する。
- `gh auth status` と対象リポジトリへのpush権限を確認する。`gh --version` と使用するコマンドの `--help` で `--attach` の対応を確認し、インストール済みCLIだけを見てコマンドからの添付が不可能と判断しない。
- 未対応なら `cli/cli` の公式リリースからOS・CPUに合う対応版を一時ディレクトリへ取得し、その実行ファイルの絶対パスを使う。既存CLIの置換やブラウザー拡張の設定変更は、この添付作業に含めない。今回の画像添付は `gh 2.102.0` で成功しているが、バージョンを固定条件にせず機能で確認する。

## 本文への埋め込み

PR・Issueの既存本文は、操作直前に取得して一時UTF-8ファイルに保存する。PRでは「添付ファイル」欄など適切な位置へ説明と参照を加え、他の本文を保持する。更新直前に本文が変わっていれば最新内容へ追記し直す。

画像は意味のある代替テキストを付ける。本文で参照するローカルパスと `--attach` のパスを揃えると、その位置でGitHubの画像URLへ置き換わる。

```markdown
![変更したStorybookの画面](/absolute/path/screenshot.png)
```

動画をプレーヤー表示にする場合は、次の参照だけを独立した段落に置き、説明は別段落に書く。文中に埋め込むとリンク表示になる。動画には代替テキストや `#説明` を指定しない。

```markdown
![](/absolute/path/interaction.mp4)
```

```sh
gh pr edit PR_NUMBER --repo HikariTakahashi/tokiwagi-ui \
  --body-file /absolute/path/body.md \
  --attach /absolute/path/screenshot.png \
  --attach /absolute/path/interaction.mp4
```

- 新規PRは `gh pr create`、Issue本文は `gh issue create` / `gh issue edit`、依頼されたコメントへの添付は `gh pr comment` / `gh issue comment` の同じオプションを使う。
- 本文にないファイルは末尾に追加される。既存本文への末尾追加だけなら `gh pr edit PR_NUMBER --attach '/absolute/path/screenshot.png#画面の説明'` も使える。動画には `#` を付けない。
- 同じファイルを二重指定しない。複数添付は `--attach` を繰り返す。未公開のローカルパスだけをPR本文に残さず、添付成功後のURLを使う。

## 完了確認と失敗時の対応

- コマンド終了後にPR・Issue・コメントを読み戻し、指定位置がGitHubの添付URLへ置き換わり、元の本文が保たれていることを確認する。Computer Useで画像の表示、動画のプレーヤー表示と再生を確認する。動画の添付方法を調査しただけなら、実際にアップロード・再生を検証したとは報告しない。
- 複数ファイルの一部だけ成功した場合、終了コードが非ゼロでも本文は成功分で更新されることがある。再試行前に本文と添付を確認し、失敗分だけを追加して重複を防ぐ。
- CLI添付が使えない場合は、失敗理由を確認してからComputer Useのファイル選択による添付を検討する。設定変更や追加権限が必要なら理由を伝え、勝手に変更しない。
- 完了時は対象PR・Issue・コメントのリンクと添付した素材を報告する。チャットにも画像を表示する場合は実在する絶対パスのMarkdown画像リンクを使う。

仕様が変わる可能性があるため、不明点は[GitHub CLIの公式添付手順](https://docs.github.com/en/github-cli/github-cli/attaching-files-with-github-cli)と使用版のヘルプで確認する。
