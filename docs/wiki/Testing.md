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
