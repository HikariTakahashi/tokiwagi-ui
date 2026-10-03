# tokiwagi-ui 作業ガイド

## 実装時の必須スキル

このリポジトリのコード・文書・設定を実装または修正する依頼では、作業開始時に [issue-to-pr skill](.agents/skills/issue-to-pr/SKILL.md) を必ず読み、その手順を適用します。調査・説明・レビューのみでファイルを変更しない依頼には、この実装フローを適用しません。

## 役割

`tokiwagi-ui` はタスク管理アプリの独立したデザインシステムです。Astro は紹介用のランディングページ、Storybook は実装時の動作確認とルール参照に使用します。Vue向けアイコンは `src/vue/index.ts` の `TkwIcon` から利用します。React・Astroのアプリ向け実コンポーネントは未作成です。Storybookは共通資料に加え、実際のVueコンポーネントをマウントする確認ページを含みます。

- カラーの値は `tokens/colors.css`、`tokens/secondary.css`、`tokens/semantic.css`、`tokens/neutrals.css` が唯一の定義元です。全93トークン（プライマリー42、セカンダリー18、セマンティック24、ニュートラル9）は確定しています。ユーザーから変更指示があるまで値、色数、用途を維持してください。
- カラーの使用ルールと見本は Storybook の「カラー」に置きます。数値は CSS から読み込み、Storybook や LP に別の値を定義しません。
- アイコンの名前は Storybook の「アイコン/命名基準」と「アイコン/アイコン名および用途」（一覧）、各アイコンの用途・使用ルールと検索用の別名は `icons/<公開名>/README.md`、既存参照 ID は「アイコン/既存フロントエンドとの対応」が管理元です。`bell` の詳細ルールは確定済み、ほかは詳細ルール案です。README には「概要」「使用場面」「状態の表し方」「使用しない場面」「表示とアクセシビリティ」「関連アイコンと使い分け」の6セクションを記載します。SVG 原本329個は各 README と同じ `icons/<公開名>/` に収録済みです。Storybook の個別ページは README を読み込んで表示し、一覧と全個別ページに共通の表示処理を使います。既存画面への置き換えは未実装です。
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

## アイコン資産の編集

- 図形は `icons/<公開名>/<公開名>.svg` の原本のみを編集します。公開名、32×32のviewBox、座標、線幅、縦横比を保持します。用途・使用ルール・別名は同じディレクトリの `README.md` だけを編集し、`src/icons/<公開名>.mdx` は README を読み込む表示用ページとします。新規追加時は SVG・6セクションを持つ README・MDX を一組で作成し、件数のテスト・文書を更新してください。
- 一覧のカタログは原本から読み込み、基本・カレンダー・タスク・円枠・四角枠・三角枠に分類します。SVG本体をMDXやLPへ複製しません。
- Storybook の原本ダウンロードは `icons/` を `/icon-assets` に静的配信します。README の `?raw` 読み込みと静的配信のURLを重ねないでください。
- 表示変換は黒い線・塗りのcurrentColor化と表示サイズ、アクセシビリティ属性、クリッピングIDの一意化に限定します。`fill="none"`、白いクリッピング、線幅の差異は保持します。
- SVG収録済みという状態と使用ルールの確定状況は別々に記載します。`bell` 以外の詳細ルールを一括で確定扱いにしません。
- Vueの公開名・原本importは `bun run generate:icons` で生成します。追加・削除時に実行し、`src/vue/icon-sources.ts`を手編集しません。Vue 3.5以上の `useId()` でSSR対応のIDを作り、装飾SVGの読み上げ属性を固定します。複数Vueアプリを同じ文書に置く利用側は `app.config.idPrefix` を分けます。
- UI変更時の必須検証に加え、全原本との一致、線と塗りの着色、moon/toolの同時表示、検索・分類・コピー・原本ダウンロードを確認します。色の検証には既存のトークンを使います。
