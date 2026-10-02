# tokiwagi-ui 作業ガイド

## 実装時の必須スキル

このリポジトリのコード・文書・設定を実装または修正する依頼では、作業開始時に [issue-to-pr skill](.agents/skills/issue-to-pr/SKILL.md) を必ず読み、その手順を適用します。調査・説明・レビューのみでファイルを変更しない依頼には、この実装フローを適用しません。

## 役割

`tokiwagi-ui` はタスク管理アプリの独立したデザインシステムです。Astro は紹介用のランディングページ、Storybook は実装時の動作確認とルール参照に使用します。Vue・React・Astro の実コンポーネントは未作成で、今回の Storybook はフレームワーク共通の基盤資料です。

- カラーの値は `tokens/colors.css`、`tokens/secondary.css`、`tokens/semantic.css`、`tokens/neutrals.css` が唯一の定義元です。全93トークン（プライマリー42、セカンダリー18、セマンティック24、ニュートラル9）は確定しています。ユーザーから変更指示があるまで値、色数、用途を維持してください。
- カラーの使用ルールと見本は Storybook の「カラー」に置きます。数値は CSS から読み込み、Storybook や LP に別の値を定義しません。
- アイコンの名前・用途・既存参照 ID は Storybook の「アイコン/命名基準」と「アイコン/アイコン名および用途」が管理元です。現在は全項目が案で、SVG 図形のライブラリへの組み込みと既存画面への置き換えは未実装です。
- `tokiwagi-ui` の略称は `tkw` です。ライトモードを対象とし、7色のプライマリーを対等に扱います。
- Tailwind CSS v4 の共有テーマは `tokens/tailwind.css` の `@theme inline` です。既存トークンを参照し、HEX 値を複製しません。Preflight は読み込みません。

## 起動・ビルド

`tokiwagi-ui` ディレクトリで Bun 1.3.9 以上を使います。依存関係は `bun.lock` で固定します。

```sh
bun install --frozen-lockfile
bun run dev:all          # Astro LP: http://localhost:4321 / Storybook: http://localhost:6006
bun run dev              # Astro LP: http://localhost:4321
bun run storybook        # 共通資料: http://localhost:6006
bun run check
bun test
bun run build            # Astro: dist/
bun run build:storybook  # Storybook: storybook-static/
```

`dev:all` で Astro と Storybook の別々のローカルサーバーを同時に起動できます。個別起動には `dev` または `storybook` を使います。作業前に停止していた場合は、一時的な検証後に起動したプロセスを停止してください。外部公開と既存 Nuxt アプリへの適用は、明示的な依頼があるまで対象外です。

## 編集と検証

- カラーの見本、HEX、コントラスト比は CSS トークンの編集を Storybook の開発サーバー再起動なしで反映します。パース処理とコントラスト計算は `src/lib/palette.ts` を共有します。
- 欠落・不正な6桁HEX・重複は対象トークン名を含む日本語エラーで検出します。CSS コメントは除外し、コントラスト不足だけでは閲覧を止めません。
- 各色の通常・ホバー・押下と `-on`、淡い背景と `-on-subtle` の56組について、4.5:1以上を検証します。任意の色の組み合わせへの保証ではありません。
- テストの `describe` と `test` は日本語で書き、各テストの直前に目的・条件・期待結果を記す日本語コメントを置きます。テストを変更したら `bun test` を実行します。
- UI変更時は `bun run check`、`bun run build`、`bun run build:storybook` を実行し、ブラウザでモバイル・デスクトップ表示、キーボードフォーカス、ボタンのホバー・押下を確認します。

## エージェント向け文書

確定事項と作業ルールは本書に集約します。`CLAUDE.md` は本書への参照のみとします。詳細なカラーの使用ルールとアイコン案は Storybook を参照してください。
