# tokiwagi-ui 作業ガイド

## 実装時の必須スキル

このリポジトリのコード・文書・設定を実装または修正する依頼では、作業開始時に [issue-to-pr skill](.agents/skills/issue-to-pr/SKILL.md) を必ず読み、その手順を適用します。調査・説明・レビューのみでファイルを変更しない依頼には、この実装フローを適用しません。

アプリ向けの再利用可能なUIコンポーネントを新規作成する場合は、併せて [component-creator skill](.agents/skills/component-creator/SKILL.md) を読み、命名・公開API・利用例・検証の手順を適用します。

UI変更のPRでは、[github-media-attach skill](.agents/skills/github-media-attach/SKILL.md) を使い、Computer Useで確認・撮影した変更画面のスクリーンショットを添付します。操作の流れを示す必要がある場合は動画も添付します。既存PR・Issue・コメントへの画像・動画添付を依頼された場合も、同スキルを適用します。

## 役割

`tokiwagi-ui` はタスク管理アプリの独立したデザインシステムです。Astro は紹介用のランディングページ、Storybook は実装時の動作確認とルール参照に使用します。Vue向けアイコンは `src/vue/index.ts`、React向けは `src/react/index.ts` の `TIcon` から利用します。Astro向けは `src/astro/index.ts` の `TIcon` から利用します。Storybookの「コンポーネント/TIcon」にReact・Vue・Astroの利用説明と実コンポーネントの確認画面を集約します。Astro見本は公開入口の実コンポーネントをBunの別プロセスで描画したHTMLを使用し、静的Storybookにも収録します。見本の再利用時にはIDだけを表示インスタンスごとに分離し、色は親から継承します。原本・実コンポーネント変更時に開発中の見本も再生成します。フレームワーク切り替え時も選択した公開名・サイズ・色を保持し、Vueアプリはページ離脱時にアンマウントします。原本の共通表示ルールと一覧は「アイコン」に置きます。

- カラーの値は `tokens/colors.css`、`tokens/secondary.css`、`tokens/semantic.css`、`tokens/neutrals.css` が唯一の定義元です。全93トークン（プライマリー42、セカンダリー18、セマンティック24、ニュートラル9）は確定しています。ユーザーから変更指示があるまで値、色数、用途を維持してください。
- カラーの使用ルールと見本は Storybook の「カラー」に置きます。数値は CSS から読み込み、Storybook や LP に別の値を定義しません。
- ロゴは `icons/logo/logo.svg`、使用ルールは同じディレクトリの `README.md` が管理元です。Storybookの「ロゴ/使用ルール」（`src/icons/logo.mdx`）に原本を参照する32・64・128pxの見本とダウンロードを置きます。固定配色・最小32pxのブランド資産として扱い、汎用アイコン329種の一覧・個別ページ照合・TIcon公開名生成から分離します。`src/lib/icon-assets.ts` の `isBrandAssetName` で識別し、SVG原本の形状・配色は維持します。ロゴのルールは案で、アプリ画面への適用は未実施です。
- アイコンの名前は Storybook の「アイコン/命名基準」と「アイコン/アイコン名および用途」（一覧）、各アイコンの用途・使用ルールと検索用の別名は `icons/<公開名>/README.md`、既存参照 ID は「アイコン/既存フロントエンドとの対応」が管理元です。`bell` の詳細ルールは確定済み、ほかは詳細ルール案です。README には「概要」「使用場面」「状態の表し方」「使用しない場面」「表示とアクセシビリティ」「関連アイコンと使い分け」の6セクションを記載します。SVG 原本329個は各 README と同じ `icons/<公開名>/` に収録済みです。Storybook の個別ページは README を読み込んで表示し、一覧と全個別ページに共通の表示処理を使います。既存画面への置き換えは未実装です。
- `tokiwagi-ui` の略称は `tkw` です。ライトモードを対象とし、7色のプライマリーを対等に扱います。
- Tailwind CSS v4 の共有テーマは `tokens/tailwind.css` の `@theme inline` です。既存トークンを参照し、HEX 値を複製しません。Preflight は読み込みません。

## コンポーネントの命名規則

- ロゴと名称のセットはReact・Vue・Astroの `TBrand` として公開します。`TLogo` をdecorativeで再利用し、固定名称「Tokiwagi UI」を横並び・縦中央揃えで表示します。size（32/64/128、既定32）は図形幅で、配置用class以外の属性・イベント・children／slotを転送しません。書体は既存のInter・Noto Sans JP・システムフォント、名称は16px・太さ600・行高1.5、間隔8pxで、外側のpaddingを追加しません。全幅は図形幅×1.5＋8px＋名称の実測幅、高さは図形幅×1.5です。操作と状態表示は親リンクが担い、ホームリンクに `aria-label="Tokiwagi UI ホーム"` を付けます。Storybook「コンポーネント/TBrand」で3方式の実コンポーネントを確認し、Astroは専用の描画スクリプトと仮想モジュールで収録します。LP・既存アプリへの適用は未実施です。

- Tokiwagi UIがアプリ向けに公開するコンポーネント名は、アッパーキャメルケース（PascalCase）とし、接頭辞は `T` です。`T` に用途を表すPascalCase名を続けます。例：`TIcon`、`TButton`、`TTextField`。
- Vue・React・Astroで同じ用途を持つコンポーネントには同じ公開名を使います。フレームワークの違いはディレクトリや公開入口で区別します。
- コンポーネントを定義するファイルのベース名、exportするコンポーネント名、フレームワークで明示する登録名を揃えます。例：`TIcon.ts`、`TIcon.vue`、`TIcon.tsx`、`TIcon.astro`。コンポーネントに対応するprops型は `TIconProps` のように命名します。
- この規則はコンポーネントの命名に適用します。SVG図柄の公開名（`bell` など）や `tkw` を使う既存CSSクラス・カラートークンの命名は、それぞれの管理元に従います。

## 起動・ビルド

`tokiwagi-ui` ディレクトリで Bun 1.3.9 以上を使います。依存関係は `bun.lock` で固定します。

```sh
bun install --frozen-lockfile
bun run dev:all          # Astro LP: http://localhost:4321 / Storybook: http://localhost:6006
bun run dev              # Astro LP: http://localhost:4321
bun run storybook        # 共通資料: http://localhost:6006
bun run check
bun test
bun run check:react-compat # 一時環境のReact 18・19で公開型・SSR・ハイドレーションを検証
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
- Vue・React・Astro共通の公開名・原本importは `bun run generate:icons` で `src/lib/icon-sources.ts` に生成します。追加・削除時に実行し、生成ファイルを手編集しません。Vueの既存ファイルは共通データを再exportします。Vue 3.5以上の `useId()` でSSR対応のIDを作り、装飾SVGの読み上げ属性を固定します。複数Vueアプリを同じ文書に置く利用側は `app.config.idPrefix` を分けます。
- React 18・19向けの `TIcon` は `name`・`size`・`color`・`className` だけを公開します。追加属性・イベント・children・refは転送せず、読み上げ属性を固定します。Reactの `useId()` を符号化したReact専用接頭辞でIDを生成します。複数rootでは `identifierPrefix` を分け、SSRとクライアントで同じ値を使います。意味・操作名は併記テキストと親のbutton/linkが担います。React変更時は `bun run check:react-compat` も実行します。
- Astro向けの `TIcon` は `name`・`size`・`color`・文字列の `class` を公開します。追加のSVG属性・イベント・slotは転送せず、装飾SVGの読み上げ属性・viewBox・サイズを固定します。意味は併記テキスト、操作名は親のbutton/linkが担います。IDは描画時に `crypto.randomUUID()` で生成し、静的HTMLに保存します。ハイドレーションは不要です。Astro変更時は全329種×4サイズの実コンポーネント描画を検証します。
- UI変更時の必須検証に加え、全原本との一致、線と塗りの着色、moon/toolの同時表示、検索・分類・コピー・原本ダウンロードを確認します。色の検証には既存のトークンを使います。
