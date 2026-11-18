# PRの自動レビュー

- Codex Code Review は、リポジトリ単位で「すべてのプルリクエスト」「PR 作成時」を選択する。コードのレビュー観点とコメントの書式は [AGENTS.md](../AGENTS.md#code-review-rules) にある。
- GitHub Copilot は、main向けPRの作成・再オープン・下書き解除・更新時に変更を判定し、UIやパフォーマンスに関係する場合にだけレビューを依頼する。判定理由はPRのChecksから「Request Copilot Review」の実行概要を開いて確認する。無条件にCopilotを呼び出す個人設定やGitHubルールセットは対象PRで有効にしない。
- Copilotの担当とコメントの書式は [copilot-instructions.md](../.github/copilot-instructions.md) にある。レビュー環境ではNode.jsとBunを用意し、レビュー対象のStorybookをlocalhostの6006番で起動する。ブラウザー操作を確認するときはCopilotのセッションログでPlaywrightの呼び出しを確認する。
- パフォーマンスの指摘は、同じ条件で取得できた変更前後の数値を根拠にする。アイコン一覧の初期JS容量は [計測手順](icon-browser-loading.md#再計測) を参照。既存の画像比較は [単体アイコンが対象](wiki/Testing.md#アイコンの画像比較visual-tests) なので、ヘッダーなどを確認する場合は対象のStorybook画面を開く。
- 自動レビューの内容はPRのレビュー欄で、完了状況と対象コミットは `tkw-ai-review-complete` の実行概要で確認する。

## マージ条件

`main` のルールセットでは `tkw-ai-review-complete` と既存のCIを必須とする。レビュー完了の条件は、対象PRでCodexのコードレビューが1回以上完了し、Copilotが1回以上レビューを提出したか、差分の判定でCopilotが対象外になったか、公式ボットの当月の利用枠不足通知を確認できたこと。指摘件数やApproveは条件に含めない。

Codexは公式ボットの完了記録、CopilotはGitHubの提出済みレビューを使う。Codexの記録形式は公開APIとして保証されていないため、確認できない記録は成功にしない。Codexのレビューが失敗した場合はPRで `@codex review` を依頼できる。

通常ジョブと `Restore AI Review Status` は、PRの先端SHAに `tkw-ai-review-complete` を登録する。定期ジョブは5分間隔でmain向けのオープンなPRを確認し、下書き以外で先端のステータスが未登録か成功以外なら、必要なレビューの完了を確認して成功を登録する。GitHubがマージ判定用コミットを作り直しても、PRの先端SHAが同じなら登録済みの成功を使える。

通常ジョブはイベント時点のベースと先端が現在も一致する場合に、その判定を使ってステータスを登録する。定期ジョブとマージジョブは現在のPRのベースにあるスクリプトでCopilotの要否を判定する。ベースの判定結果を確認できない場合はCopilotの完了を必要とする。

ステータスは同じ先端SHAを指すPR間で共有される。mainへのマージは `Merge AI Reviewed PR` をmainで手動実行し、PR番号と先端の完全なSHAを指定する。ジョブはそのPR自身のレビューとベース・先端を再確認し、GitHub Appから先端SHAを指定して通常マージする。GitHubは既存の必須チェックも照合する。

## Copilotの利用上限

対象PRにCopilot公式ボットの `insufficient remaining quota` 通知がある場合、当月中はレビューの再依頼を省略する。通常の完了確認・定期復元・マージ時の確認もCopilotを「利用上限のため省略」と扱い、Codexの完了を引き続き必須とする。通知はレビュー完了として数えず、一般的なサービス障害・権限エラー・利用者が転載した通知では省略しない。初回依頼の後に利用枠不足が通知された場合も、完了確認の待機中に省略へ切り替わる。

通知の有効範囲はそのPR内・UTCの同じ年月に限る。[GitHubの月次利用枠](https://docs.github.com/en/copilot/reference/copilot-billing/license-changes#included-monthly-allowance-reset)が更新される翌月は、次のPR更新時に通常の依頼を再開する。別PRの通知は参照しないため、新しいPRは最初の依頼後にそのPRの通知で判定する。API応答だけのエラーや未確認の通知形式は、利用枠不足と推測して通過させない。

## マージ専用の設定

1. マージ専用の非公開GitHub Appをこのリポジトリにだけインストールする。リポジトリ権限は `Contents: write`、`Pull requests: read`、`Commit statuses: read` を与える。
2. ActionsのEnvironment `ai-review-merge` を作り、デプロイをmainブランチに限定する。そのEnvironmentにApp IDを変数 `AI_REVIEW_MERGE_APP_ID`、秘密鍵をSecret `AI_REVIEW_MERGE_APP_PRIVATE_KEY` として登録する。
3. mainを対象に、`Restrict updates` だけのルールセットを別に作る。そのルールセットで、マージ専用AppにPR経由の更新を許可する。既存の必須チェックを定義するルールセットは通常どおりAppからのマージにも適用する。
4. 初回導入時は既存の `CI` を `gh workflow run ci.yml --ref <導入PRのブランチ>` で手動実行し、「PR先端のAIレビュー完了ステータスを復元」ジョブが成功したことを確認する。マージ専用ワークフローの初回起動にはmainへの反映が必要なため、導入PRの確認済みコミットをチェックアウトした管理者端末で、同じ判定スクリプトを使う。

   下のコマンドは、対象リポジトリに限定して発行した短命のGitHub Appインストールトークンを環境変数 `GH_TOKEN` に設定した端末で実行する。トークンや秘密鍵はログやコマンドの引数に書かない。

   ```sh
   GITHUB_API_URL=https://api.github.com \
   GITHUB_REPOSITORY=HikariTakahashi/tokiwagi-ui \
   PR_NUMBER=<対象PR番号> PR_HEAD_SHA=<確認済みの先端SHA> \
   bun scripts/ai-review-completion.ts --merge-reviewed
   ```

## 動作確認

1. main反映後、`Restore AI Review Status` の最初の定期実行を確認する。`gh run list --workflow restore-ai-review-status.yml --event schedule --branch main` で定期実行に絞り、マージ後の実行が成功することを確認する。
2. main向けの試験PRで、文書だけの差分ならCodex完了後に、UIに関わる差分なら必要なCopilotレビューの提出後に、先端SHAの `tkw-ai-review-complete` が成功することを確認する。
3. レビュー完了済みの試験PRと同じ先端SHAで、別ブランチからmain向けのPRを開く。対象PRのレビューが未完了の間に `Merge AI Reviewed PR` へそのPR番号とSHAを入力し、レビュー未完了で拒否され、PRがオープンのままであることを確認する。mainの更新制限と既存の必須チェックが有効であることも確認する。

Copilot APIが自動トークンを認可しない場合は、GitHubのエラーを確認する。必要な場合に限り、Copilot利用資格のあるアカウントの対象リポジトリに絞った `Pull requests: write` のトークンを、ActionsのリポジトリSecret `COPILOT_REVIEW_TOKEN` に登録する。レビュー依頼のジョブはPR側のコードを実行しない。
