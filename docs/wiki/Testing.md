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

`check:react-compat` は一時ディレクトリにReact 18.3.1と開発環境のReact 19系をそれぞれ導入し、対応する型定義で公開型・全329原本×4サイズ・SSR・ハイドレーションを検証します。依存取得にはネットワーク接続が必要です。通常の `node_modules` とロックファイルは変更せず、一時ディレクトリは終了時に削除します。


## GitHub ActionsでのCI

[CIワークフロー](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/.github/workflows/ci.yml)は、main向けPRの作成・更新・再オープン、mainへのpush、Actions画面からの手動実行で起動します。文書だけの変更も対象です。PRでは変更を含むマージ結果を取得し、mainのコードだけを検証する構成にはしません。

以下の5ジョブを独立して並列実行します。1つが失敗しても他の検証は継続します。同じPRの更新で新しい実行が始まると、古い実行は中止されます。

| チェック名 | コマンド | 確認内容 |
| --- | --- | --- |
| `tkw-typecheck` | `bun run check` | 型・Astroテンプレート・公開型の検査 |
| `tkw-tests` | `bun test` | 色・アイコン・各方式の部品・見本・Wiki同期のテスト |
| `tkw-react-compat` | `bun run check:react-compat` | React 18・19での公開型・描画・SSR・ハイドレーション |
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

## テスト環境と対象

テストランナーはBun Test（`bun:test`）です。DOMとハイドレーションの検証にはHappy DOM、React・VueのSSRには各フレームワークのサーバー描画機能、AstroにはコンパイラとContainer APIを使用します。新しいテスト基盤は導入しません。

- `src/lib/*.test.ts`：トークンの読み込み、色の組み合わせ、アイコン原本・公開名・変換。
- `src/react/`・`src/vue/`・`src/astro/` のテスト：公開Props、サイズ・不正入力、全原本の描画、ID分離、SSR・ハイドレーション（対応方式）。
- `src/stories/`・`src/stories/components/` のテスト：原本資料の参照、見本の切り替え・非同期読込、URL保存など。
- `scripts/sync-wiki.test.ts`：一時的なGitリポジトリでWiki原稿の初回登録・追加・更新・削除・改名・差分なし、対象外ページと画像の保持、不正入力での停止を検証します。単独実行は `bun test scripts/sync-wiki.test.ts` で、BunとGit以外の依存やネットワーク接続は不要です。実際のGitHub Actions認証・Wikiへのpushは、mainマージ後の公開確認で別途検証します。
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
