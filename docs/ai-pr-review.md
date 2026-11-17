# PRの自動レビュー

- Codex Code Review は、リポジトリ単位で「すべてのプルリクエスト」「PR 作成時」を選択する。コードのレビュー観点とコメントの書式は [AGENTS.md](../AGENTS.md#code-review-rules) にある。
- GitHub Copilot は、main向けPRの作成・再オープン・下書き解除・更新時に変更を判定し、UIやパフォーマンスに関係する場合にだけレビューを依頼する。判定理由はPRのChecksから「Request Copilot Review」の実行概要を開いて確認する。無条件にCopilotを呼び出す個人設定やGitHubルールセットは対象PRで有効にしない。
- Copilotの担当とコメントの書式は [copilot-instructions.md](../.github/copilot-instructions.md) にある。レビュー環境ではNode.jsとBunを用意し、レビュー対象のStorybookをlocalhostの6006番で起動する。ブラウザー操作を確認するときはCopilotのセッションログでPlaywrightの呼び出しを確認する。
- パフォーマンスの指摘は、同じ条件で取得できた変更前後の数値を根拠にする。アイコン一覧の初期JS容量は [計測手順](icon-browser-loading.md#再計測) を参照。既存の画像比較は [単体アイコンが対象](wiki/Testing.md#アイコンの画像比較visual-tests) なので、ヘッダーなどを確認する場合は対象のStorybook画面を開く。
- 自動レビューの内容はPRのレビュー欄で、完了状況と対象コミットは `tkw-ai-review-complete` の実行概要で確認する。

## マージ条件

試験PRで判定を確認した後に、`main` のルールセットへ `tkw-ai-review-complete` を必須チェックとして追加する。既存のCIも引き続き必須とする。このチェックは同じPRでCodexのコードレビューが1回以上完了し、Copilotが1回以上レビューを提出したか、差分の判定でCopilotが対象外の場合に成功する。指摘件数やApproveは条件に含めない。

Codexは公式ボットの完了記録、CopilotはGitHubの提出済みレビューを使う。Codexの記録形式は公開APIとして保証されていないため、確認できない記録は成功にしない。Codexのレビューが失敗した場合はPRで `@codex review` を依頼できる。

GitHubがマージ判定用コミットを再生成すると、そのSHAに必須ステータスを再登録する必要がある。`Restore AI Review Status` は5分間隔で、main向けのオープンなPRのうち下書き以外を確認する。現在のマージ判定用コミットの最新ステータスが成功以外か未登録の場合に、同じPRのレビュー完了条件を確認して成功を登録する。通常ジョブが制限時間内に完了を確認できなかった場合も、その後にレビューが完了すれば定期ジョブで更新される。再登録時の判定結果はこのワークフローの実行概要で確認できる。

## 動作確認

1. ワークフローを `main` に反映し、必須チェックにする前に試験PRを開く。文書だけの差分で、Codexの完了とCopilotの対象外によって `tkw-ai-review-complete` が成功することを確認する。
2. 試験PRにCSSなどの差分を加え、Copilotが依頼され、レビュー提出前は待機、提出後は完了になることを確認する。CopilotのセッションログでStorybookの確認状況も調べる。
3. Copilot APIが自動トークンを認可しない場合は、GitHubのエラーを確認する。必要な場合に限り、Copilot利用資格のあるアカウントの対象リポジトリに絞った `Pull requests: write` のトークンを、ActionsのリポジトリSecret `COPILOT_REVIEW_TOKEN` に登録する。レビュー依頼のジョブはPR側のコードを実行しない。
4. 試験結果を確認して `main` に必須チェックを追加し、既存の必須CIと承認ルールを確認する。
