# テスト方法

`tokiwagi-ui` ディレクトリで、CIと同じNode.js 22.16.0・Bun 1.3.9を使用して実行します。

```sh
bun install --frozen-lockfile
bun test
bun run check
bun run check:react-compat
bun run build
bun run build:storybook
```

Astro の出力は `dist/`、Storybook の出力は `storybook-static/` です。Vue・React・Astro向けの `TIcon` があります。Storybookの「コンポーネント/TIcon・TBrand・TLogo」はbell-offの使用例と同じストーリー形式です。Canvasには見本1つだけを中央表示し、設定は標準Controlsとargsで変更・URL保存します。TIconではReact・Vue・Astroを切り替えても公開名・サイズ・色を保持します。詳細説明のAstro側への移設は別作業です。npm配布・外部ホスティングと既存Nuxt画面の置き換えは未実施です。GitHubリポジトリ自体はPublicです。

`check:react-compat` は一時ディレクトリにReact・React DOMの18.0.0、18.3.1、19.0.0、開発依存の19系をそれぞれ導入します。各環境で公開型、テスト用APIの型、全329原本×4サイズのSSR、Happy DOM上の実コンポーネントのハイドレーション、props更新を検証します。依存取得にはネットワーク接続が必要です。通常の `node_modules` と `bun.lock` は変更せず、一時ディレクトリは成功・失敗にかかわらず削除します。各バージョンは既存のCIジョブ `tkw-react-compat` でも同じコマンドで継続検証します。

### React互換性の検証結果

2026年10月30日、[Issue #29](https://github.com/HikariTakahashi/tokiwagi-ui/issues/29)で確認しました。コンポーネントの対応範囲はpeer dependencyの `^18.0.0 || ^19.0.0` を維持します。ReactとReact DOMは表の同一バージョンを組み合わせています。開発依存の行は `package.json` に追従し、他の3行は固定します。

| React / React DOM | `@types/react` | `@types/react-dom` | 公開型 | テスト用APIの型 | SSR・DOMハイドレーション・props更新 |
| --- | --- | --- | --- | --- | --- |
| 18.0.0（18系の下限） | 18.3.18 | 18.3.5 | 成功 | 成功 | 18件成功 |
| 18.3.1（既存対象） | 18.3.18 | 18.3.5 | 成功 | 成功 | 18件成功 |
| 19.0.0（19系の下限） | 19.0.0 | 19.0.0 | 成功 | 成功 | 18件成功 |
| 19.3.0（現在の開発依存） | 19.3.0 | 19.3.0 | 成功 | 成功 | 18件成功 |

互換性チェック実行前後で、通常の `node_modules` 内のファイルと `bun.lock` のSHA-256が一致することも確認しました。

公開入口からTIcon・TLogo・TBrandの許可propsと拒否すべき値を型検査します。SSR出力を `hydrateRoot` に渡し、SVG・画像・名称のDOMを再利用し、復旧エラーやconsole警告が出ないことを確認します。TIconではIDとクリッピング参照、複数rootの `identifierPrefix` による分離、図柄・サイズ・色・クラスの更新と復元を検証します。TLogo・TBrandではサイズや装飾状態の更新、原本画像の保持、親リンクの操作も検証します。これはHappy DOMによるDOM検証で、実ブラウザの見た目の確認とは別です。

React本体の下限とテスト用API・型定義の提供範囲は区別します。React 18.0.0は `React.act` をexportしないため、テスト専用の `src/react/test-act.ts` で `react-dom/test-utils` の `act` に切り替えます。新しいバージョンでは `React.act` を使い、非推奨警告を抑制しません（[React公式の案内](https://react.dev/warnings/react-dom-test-utils)）。アプリ向け公開入口はこのヘルパーを読み込みません。

初期調査では `@types/react`・`@types/react-dom` とも18.0.0でも公開型の検査は成功しました（旧React型の依存先 `@types/scheduler` は0.16.8に固定）。一方、`@types/react-dom` 18.0.0・18.0.11には `renderToString` の第2引数の型宣言がなく、`identifierPrefix` を使うテストの型検査は失敗しました。継続検証ではこのSSR用APIを表現できる18.3.18・18.3.5の型定義を使います。テスト用の型定義を揃えるための選択であり、コンポーネントの実行時下限を18.3へ変更するものではありません。すべての過去の型定義の組み合わせへの対応は保証しません。


## GitHub ActionsでのCI

[CIワークフロー](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/.github/workflows/ci.yml)は、main向けPRの作成・更新・再オープン、mainへのpush、Actions画面からの手動実行で起動します。文書だけの変更も対象です。PRでは変更を含むマージ結果を取得し、mainのコードだけを検証する構成にはしません。

以下の5ジョブを独立して並列実行します。1つが失敗しても他の検証は継続します。同じPRの更新で新しい実行が始まると、古い実行は中止されます。

| チェック名 | コマンド | 確認内容 |
| --- | --- | --- |
| `tkw-typecheck` | `bun run check` | 型・Astroテンプレート・公開型の検査 |
| `tkw-tests` | `bun test` | 色・アイコン・各方式の部品・見本・Wiki同期のテスト |
| `tkw-react-compat` | `bun run check:react-compat` | React 18.0.0・18.3.1・19.0.0・開発依存19系の公開型・テスト用APIの型・SSR・ハイドレーション・更新 |
| `tkw-build` | `bun run build` | Astro紹介ページの静的ビルド |
| `tkw-storybook` | `bun run build:storybook` | Astro見本生成を含むStorybookの静的ビルド |

各ジョブはUbuntu 24.04・Node.js 22.16.0・Bun 1.3.9を使用し、`bun install --frozen-lockfile`で本体の依存関係を導入します。React互換性チェックの一時環境は既存スクリプトで別途依存取得を行うため、ネットワーク接続が必要です。各ジョブの制限時間は30分、リポジトリへの権限は読み取りのみです。利用するActionはコミットSHAで固定します。CIからWiki・サイト・パッケージの公開は行いません。

### マージ条件

GitHub側の既存ルールセット「main via pull request」に、上記5チェックすべての成功を必須条件として設定します。提供元は実際のチェック結果から確認したGitHub Actionsに固定し、mainの最新変更を取り込んだ状態での成功を要求します。既存のPR必須・承認数0・バイパス対象なしの設定は維持します。

ワークフローを追加するだけでは、このGitHub側の設定は変更されません。導入時はPR上で全チェックの成功を確認してから必須条件を設定し、失敗時のマージ禁止と復元後の成功を確認します。実施結果は導入PRに記録します。チェック名を変更する場合は、ルールセットの必須チェック名も合わせて更新してください。

### 失敗時の調査と再実行

1. PRのChecks、または[Actions](https://github.com/HikariTakahashi/tokiwagi-ui/actions)の「CI」から、失敗したジョブとステップのログを確認します。
2. コードの問題なら、上表の対応コマンドをローカルで実行して原因を修正します。依存導入の失敗では`package.json`と`bun.lock`の整合性、通信、指定した実行環境を確認します。ロックファイルを更新する必要がある場合はローカルで更新してPRに含め、CIの固定インストールを外して回避しません。
3. 修正をPRへpushすると5ジョブが自動で再実行されます。一時的な通信失敗などでコード変更が不要なら、Actionsの「Re-run failed jobs」で失敗したジョブを再実行します。
4. mainが更新されている場合はその変更を作業ブランチへ取り込み、再検証します。PRの最新の検証対象について5チェックすべてが成功したことを確認してからマージします。古い実行や中止された実行を成功の代わりに扱いません。

ビルド成功は見た目やキーボード操作の正しさまで保証しません。UI変更時のブラウザ確認は、引き続き以下の作業ルールに従います。

## アイコンの画像比較（Visual Tests）

[Issue #32](https://github.com/HikariTakahashi/tokiwagi-ui/issues/32)の画像比較基盤として、Playwright 1.64.1で既存のStorybook「コンポーネント/TIcon」の公開React／Vueコンポーネントを撮影します。線の `bell`、塗りの `grip-vertical`、クリッピングの `moon`・`tool` を、16・20・24・32px、Firefox・WebKitで検証します。計64条件で、空の画面でないこととサイズを確認してから、図柄と周囲16pxの余白を比較します。背景・前景は既存のニュートラルトークンを使用します。

`e2e/icons.visual.ts` と `playwright.config.ts` が実行元です。画面は800×600px、倍率1、ライトモードに固定し、アニメーションを停止します。ピクセル差を許容せず、通常実行で基準画像を作成・変更しません。Playwright Testは `.visual.ts` を対象とし、既存のBun Testから分離します。

### 画像の保存先と閲覧方法

| 用途 | 保存先 | 保存期間 |
| --- | --- | --- |
| 承認済みの基準画像64枚 | [保管用リポジトリ](https://github.com/HikariTakahashi/tokiwagi-ui-visual-results)のRelease `visual-test-baselines` のZIP | 継続保存。更新前のZIPも履歴として保持 |
| 成功・失敗した各テストの結果ZIP | 保管用リポジトリのRelease `visual-report-<run_id>-<run_attempt>` | 作成から7日。定期処理でReleaseごと削除 |
| 画像一覧と差分レポートの閲覧 | 保管用リポジトリのGitHub Pages | 7日間を対象に公開 |
| レポートと基準画像候補の受け渡し | GitHub Actions Artifacts | 7日間 |
| 公開処理用のPages成果物 | GitHub Actions Artifacts | 1日間 |

公開先は **[画像比較レポート一覧](https://hikaritakahashi.github.io/tokiwagi-ui-visual-results/)** です。公開処理が完了すると、実行ごとの画像一覧からPNGを直接開き、「詳細・差分を見る」からPlaywrightレポートへ移動できます。失敗した条件ではExpected（基準）・Actual（今回）・Diff（差分）を確認します。成功した条件の今回画像も一覧に残します。テスト開始前に失敗して画像がない場合はActionsのログを確認してください。

基準画像・レポートは公開される構成です。画像をGitの追跡対象にせず、基準画像の一時キャッシュ `.visual-baselines/`、候補 `.visual-candidates/`、レポート `playwright-report/`・`test-results/`、公開ファイル `.visual-site/` はGit管理から除外します。移行前にコミットしたPNGは過去のGit履歴に残ります。履歴の書き換えは行いません。

`Transfer Visual Reports` がテスト完了後に元リポジトリの成果物を保管用リポジトリのReleaseへ転送し、公開更新を通知します。保管用リポジトリの `Publish Visual Reports` は通知時と毎時17分に期限切れReleaseを削除し、有効なレポートだけでサイトを作り直します。古い一覧項目と画像・HTMLのファイルも公開対象から除去します。転送や再転送で保存期間を延長せず、元の成果物の作成日時を引き継ぎます。厳密な秒単位のアクセス遮断ではなく、定期実行の遅延・失敗や配信キャッシュにより削除が遅れる場合があります。定期実行が失敗した場合はログを確認し、手動で再実行してください。ダウンロード済みの画像は回収できません。

### ローカルのコマンド

```sh
bun run test:visual        # 外部の承認済み基準画像を取得して比較
bun run test:visual:update # 更新候補を作成。外部の承認済み画像は変更しない
bun run test:visual:report # ローカルのPlaywrightレポートを開く
```

通常実行は保管用リポジトリのRelease本文の参照情報からZIPを取得し、SHA-256・生成元コミット・Playwrightバージョン・64条件・PNG寸法を検証して `.visual-baselines/` に展開します。取得失敗や不整合はテスト失敗として扱います。認証が必要な環境では `GH_TOKEN` を設定します。オフライン検証では明示的に `TKW_VISUAL_BASELINE_ARCHIVE=/path/to/baselines.zip` を指定でき、同じ検証を通したZIPを使用します。

各実行はStorybookの静的ビルドと127.0.0.1:6006での配信を開始・終了します。同ポートの既存サーバーは再利用しないため、専用コンテナーでの実行を推奨します。Macでの調査には先に `bunx --no-install playwright install firefox webkit` を実行します。基準画像はLinux用であり、Macでの撮影結果をCIの基準として承認しません。

### CIと同じ環境で比較する

Linux amd64の公式Playwrightコンテナーを使います。イメージ・Playwright・Node.js・BunはCIと同じバージョンに固定します。依存関係を専用の一時ボリュームへ導入し、ホストの `node_modules` を変更しません。Apple Siliconでも `linux/amd64` を指定します。外部基準画像と依存関係の取得にはネットワーク接続が必要です。

```sh
docker run --rm --platform linux/amd64 --ipc=host \
  -v "$PWD":/work -v /work/node_modules -w /work -e CI=true \
  mcr.microsoft.com/playwright:v1.64.1-noble@sha256:47b510dd9230bf0b9bfc9b20102241e577ea7a99334ab4c3ca19f19770e9b8ea \
  bash -lc 'npm install --prefix /tmp/tkw-visual-tools --no-package-lock node@22.16.0 bun@1.3.9 &&
    export PATH="/tmp/tkw-visual-tools/node_modules/.bin:$PATH" &&
    bun install --frozen-lockfile &&
    bun run test:visual'
```

候補を生成する場合は最後を `bun run test:visual:update` に変更します。全64条件が成功すると `.visual-candidates/baselines.zip` を生成します。ローカル実行だけでは外部基準の切り替えを行いません。

CIでは `setup-bun` がZIPを展開するため、コンテナーに含まれない `unzip` を事前に導入します。また、Firefoxが起動を拒否しないよう、GitHub Actionsのホームディレクトリを実行ユーザーの所有に合わせます。上記Docker例はnpm経由でBunを導入するため、Action自体の導入経路の検証とは分けます。

### Actionsでの実行・基準画像の承認

`Visual Tests`（`.github/workflows/visual.yml`）はmain向けPR、mainへのpush、手動実行で `tkw-visual` を実行します。通常は承認済み画像との比較だけです。読み取り権限で実行し、制限時間は30分、ActionとコンテナーはSHA・ダイジェストで固定します。成功・失敗ともに `visual-report-<run_id>-<run_attempt>` を7日保存し、main上の転送ワークフローを経て、保管用リポジトリの公開ワークフローで専用URLへ反映します。fork由来の実行は外部公開せず、Actionsの成果物で確認します。ActionsのSummaryにも実行別URLを記載します。

基準画像を変更するときは次の手順を使います。

1. **Visual Tests → Run workflow** で対象ブランチを選び、`update_baselines` をオンにします。
2. 成功した実行の公開画像一覧で全64条件を確認します。候補ZIPは `visual-baselines-<run_id>-<run_attempt>` として7日保存されます。意図しない崩れはコードを修正し、基準画像の更新で解消しません。
3. **Approve Visual Baselines → Run workflow** で `main` を選び、確認した候補生成の実行IDを入力します。
4. 承認処理は同じリポジトリの成功した手動実行・候補の生成元・64条件を検証し、Releaseへ新しいZIPを保存します。保存完了後に参照を切り替え、旧ZIPは保持します。commit・pushは行いません。
5. 更新フラグなしで対象PRの画像比較を再実行し、成功を確認します。Playwright更新時も同じ手順で再確認します。

元リポジトリの組み込みトークンは読み取り権限を維持します。転送・承認処理だけが、保管用リポジトリに限定した `VISUAL_STORAGE_TOKEN` を使用します。通常のPRテストへこのSecretを渡しません。転送はmainのコードでZIPを処理し、PR側のコードを権限付きジョブで実行しません。保管用リポジトリの公開処理は期限切れReleaseの削除に `contents: write`、Pagesデプロイに `pages: write` と `id-token: write` を使用します。

初回は以下の設定が必要です。

1. 保管用の公開リポジトリ `HikariTakahashi/tokiwagi-ui-visual-results` を作成し、公開・削除処理をmainへ登録します。
2. 保管用リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします。
3. [Fine-grained tokenの作成画面](https://github.com/settings/personal-access-tokens/new)でResource ownerを `HikariTakahashi`、Repository accessを **Only select repositories** にし、**`tokiwagi-ui-visual-results` だけ**を選択します。Repository permissionsの **Contents: Read and write** を付与します。有効期限を設定し、期限前に更新してください。
4. 元リポジトリ `tokiwagi-ui` の **Settings → Secrets and variables → Actions → New repository secret** で、Nameを **`VISUAL_STORAGE_TOKEN`** とし、発行したトークンをSecretへ登録します。値はGit・文書・チャットに記載しません。
5. 確認済みの初期基準64枚を保管用リポジトリのReleaseへ登録し、通常比較が成功することを確認します。
6. 元リポジトリの本ワークフローをmainへ導入します。その後はテスト完了時の転送と候補の手動承認が使えます。

トークンによるRelease保存・公開更新通知には保管用リポジトリのContents書き込み権限を使います。元リポジトリへの書き込み権限を与える必要はありません。設定の詳細は[トークン管理](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)・[Actions Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)を参照してください。

### 検証範囲

移行前のコミットe020d56では、[GitHub上のVisual Tests](https://github.com/HikariTakahashi/tokiwagi-ui/actions/runs/41031486178)で全64条件と、既存の5つのCIチェックの成功を確認しています。外部保存への移行では、同じ64枚を約63KBのZIPへ退避し、整合性を検証してから作業ツリーのPNGを削除します。外部への初回登録とPages公開の完了は、導入PRの検証欄に別途記録します。

2026年10月30日、外部保存への移行について以下をローカルで検証しました。GitHub Releaseへの初回アップロード・Pages設定・main上の公開ワークフロー実行は、この結果に含めません。

| 検証 | 結果 |
| --- | --- |
| 外部ZIPの復元と比較 | CIと同じ固定コンテナーで64条件成功。成功画像64枚とHTML一覧を生成 |
| 差分の検出 | 一時ZIP内のReact・moon・16px・Firefoxの基準だけを別図柄にし、77ピクセルの差で失敗。Expected・Actual・Diff・トレースを生成。正しい基準へ復元済み |
| 画面と操作 | デスクトップ・375px幅で画像表示、64枚の読み込み、横はみ出しなし、キーボードフォーカス、画像一覧から詳細への遷移、差分の並列表示を確認 |
| 保存・転送処理の単体テスト | 元リポジトリで11件成功。保管先の公開・削除処理は5件成功。7日境界・期限切れReleaseと画像の削除・不正ZIP・失敗時の参照維持・トークン分離などを確認。通信は模擬 |
| 既存検証を含む単体テスト | `bun test`：元リポジトリ128件、保管用リポジトリ5件成功 |
| 型検査・ビルド | 型検査、Astro・Storybookのビルド成功。型検査には既存のReact非推奨ヒント1件 |
| ワークフロー | 画像比較・転送・承認と、保管先の公開の4ファイルでactionlint成功 |

2026年10月31日、専用リポジトリの作成とPagesのActions公開設定を完了し、[初回公開ワークフロー](https://github.com/HikariTakahashi/tokiwagi-ui-visual-results/actions/runs/41168615505)が成功しました。[初期基準画像のRelease](https://github.com/HikariTakahashi/tokiwagi-ui-visual-results/releases/tag/visual-test-baselines)へ64枚のZIP（63,045 bytes）を登録し、外部から再取得してSHA-256と全64条件の整合性を確認済みです。元リポジトリの自動転送・手動承認はmainへの導入後に稼働します。

本テストは単体アイコンの描画回帰が対象です。複数アイコンの同時表示、親button／linkのキーボード操作、実Safari・VoiceOverの読み上げは、この画像比較だけで完了扱いにしません。Issue #32には実機環境・期待結果・実結果の記録が残ります。PlaywrightのWebKit検証は実Safari・VoiceOverの確認と区別します。マージ必須条件への `tkw-visual` 追加もGitHub側で別途設定・確認が必要です。

## テスト環境と対象

単体テストのランナーはBun Test（`bun:test`）です。DOMとハイドレーションの検証にはHappy DOM、React・VueのSSRには各フレームワークのサーバー描画機能、AstroにはコンパイラとContainer APIを使用します。ブラウザの画像比較だけはPlaywright Testで別に実行します。

- `src/lib/*.test.ts`：トークンの読み込み、色の組み合わせ、アイコン原本・公開名・変換。
- `src/react/`・`src/vue/`・`src/astro/` のテスト：公開Props、サイズ・不正入力、全原本の描画、ID分離、SSR・ハイドレーション（対応方式）。
- `src/stories/`・`src/stories/components/` のテスト：原本資料の参照、見本の切り替え・非同期読込、URL保存など。
- `scripts/sync-wiki.test.ts`：一時的なGitリポジトリでWiki原稿の初回登録・追加・更新・削除・改名・差分なし、対象外ページと画像の保持、不正入力での停止を検証します。単独実行は `bun test scripts/sync-wiki.test.ts` で、BunとGit以外の依存やネットワーク接続は不要です。実際のGitHub Actions認証・Wikiへのpushは、mainマージ後の公開確認で別途検証します。
- `scripts/visual-*.test.ts`：画像アーカイブの整合性・不正入力、基準画像更新の失敗時の保持、転送期限と転送先の認証分離を検証します。GitHub通信は模擬し、実サービスへのアップロード・公開は行いません。期限切れReleaseと公開ファイルの削除は保管用リポジトリのテストで検証します。
- `e2e/*.visual.ts`：PlaywrightによるFirefox・WebKitの画像比較。`bun test` の対象には含めません。
- `bun run check`：Astro Checkによる型・テンプレートの診断。型検査用ファイルも確認します。
- `bun run build`・`bun run build:storybook`：紹介ページと静的資料のビルド確認。

56組の既定の前景・背景ペアについてコントラスト比4.5:1以上を検証します。任意の色の組み合わせやすべてのUIへの保証ではありません。ブランド部品のテストも既存実装の回帰確認として残しますが、MITによる利用許諾とは別です。

## テスト追加時の基本ルール

- `describe` と `test` の名前は日本語にします。
- 各テスト直前に、目的・条件・期待結果を日本語コメントで記載します。
- 公開API・不正値・複数インスタンスなど、意味のある境界を検証します。
- テストを変更したら `bun test` を実行します。
- UI変更時は型検査・両ビルドに加え、モバイル／デスクトップ、キーボードフォーカス、ホバー・押下をブラウザで確認します。
- 実行していない項目・ネットワーク制約・失敗した項目をPRの検証欄に明記します。ブラウザでの確認をBun Testだけで代替したと報告しません。
