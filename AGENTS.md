# tokiwagi-ui 作業ガイド

## 実装時の必須スキル

このリポジトリのコード・文書・設定を実装または修正する依頼では、作業開始時に [issue-to-pr skill](.agents/skills/issue-to-pr/SKILL.md) を必ず読み、その手順を適用します。調査・説明・レビューのみでファイルを変更しない依頼には、この実装フローを適用しません。

アプリ向けの再利用可能なUIコンポーネントを新規作成する場合は、併せて [component-creator skill](.agents/skills/component-creator/SKILL.md) を読み、命名・公開API・利用例・検証の手順を適用します。

UI変更時はブラウザーで表示と操作を確認します。確認と撮影には利用可能なブラウザーツール、Playwright、手動操作などを使えます。UI変更のPRでは [github-media-attach skill](.agents/skills/github-media-attach/SKILL.md) に従い、変更箇所と画面の文脈が分かるスクリーンショットを「添付ファイル」欄に添付します。操作の流れを示す必要がある場合は動画も添付します。撮影・添付・添付後の表示確認のいずれかを実施できない場合は、該当項目と理由をPRに記載します。既存PR・Issue・コメントへの画像・動画添付を依頼された場合も、同スキルを適用します。

## Code Review Rules

Codex Code Review はPRのコード差分と既存の呼び出し元を確認します。バグ・論理エラー、セキュリティ、エラー処理、可読性・命名、既存機能への影響を確認してください。公開部品の変更では、既存の設定名・型・既定値・属性・イベントと、React・Vue・Astroの共通仕様を照合します。

指摘は日本語で、原因に関係する変更行に付けます。ファイル名と実際の該当コードを数行引用し、再現条件、期待する動作と実際の動作、利用者への影響、修正案を示してください。削除が原因の場合は変更前の差分を引用します。このPRで生じる具体的な問題に集中します。

Copilot Code Review の担当は、`.github/copilot-instructions.md` のUIとパフォーマンスです。

## 役割

`tokiwagi-ui` はタスク管理アプリの独立したデザインシステムです。Astro は紹介用のランディングページ、Storybook は実装時の動作確認とルール参照に使用します。Vue向けアイコンは `src/vue/index.ts`、React向けは `src/react/index.ts` の `TIcon` から利用します。Astro向けは `src/astro/index.ts` の `TIcon` から利用します。Storybookの「コンポーネント/TIcon」はReact・Vue・Astroの実コンポーネント表示を確認するストーリーです。公開APIと利用例はWiki原稿の `docs/wiki/Usage.md`、MIT対象外のTLogo・TBrandは `docs/brand-reference.md` で保持し、Astro側への説明ページ移設は別作業です。Astro見本は公開入口の実コンポーネントをBunの別プロセスで描画したHTMLをJSONとして取得し、静的Storybookにも収録します。仮想モジュールはJSONのURLを供給し、共通のfetchローダーで読み込み失敗後の再試行を可能にします。見本の再利用時にはIDだけを表示インスタンスごとに分離し、色は親から継承します。原本・実コンポーネント変更時に開発中の見本も再生成します。フレームワーク切り替え時も選択した公開名・サイズ・色を保持し、Vueアプリはページ離脱時にアンマウントします。原本の共通表示ルールと一覧は「アイコン」に置きます。

- カラーの値は `tokens/colors.css`、`tokens/secondary.css`、`tokens/semantic.css`、`tokens/neutrals.css` が唯一の定義元です。全93トークン（プライマリー42、セカンダリー18、セマンティック24、ニュートラル9）は確定しています。ユーザーから変更指示があるまで値、色数、用途を維持してください。
- カラーの使用ルールと見本は Storybook の「カラー」に置きます。数値は CSS から読み込み、Storybook や LP に別の値を定義しません。
- 4系統のカラーのCanvasは中央に色見本を1つ置きます。プライマリー・セカンダリー・セマンティックは色と4状態、ニュートラルは9段階の色を標準Controlsで切り替えてURLに保持します。値と配色のコントラスト比は「カラー/使用ルール」で確認します。
- ロゴは `icons/logo/logo.svg`、使用ルールは同じディレクトリの `README.md` が管理元です。Storybookの「ロゴ/使用ルール」（`src/icons/logo.mdx`）に原本を参照する32・64・128pxの見本とダウンロードを置きます。固定配色・最小32pxのブランド資産として扱い、汎用アイコン336種の一覧・個別ページ照合・TIcon公開名生成から分離します。`src/lib/icon-assets.ts` の `isBrandAssetName` で識別し、SVG原本の形状・配色は維持します。ロゴのルールは案で、アプリ画面への適用は未実施です。
- アイコンの名前は Storybook の「アイコン/命名基準」と「アイコン/アイコン名および用途」（一覧）、各アイコンの用途・使用ルールと検索用の別名は `icons/<公開名>/README.md`、既存参照 ID は「アイコン/既存フロントエンドとの対応」が管理元です。`bell` の詳細ルールは確定済み、ほかは詳細ルール案です。README には「概要」「使用場面」「状態の表し方」「使用しない場面」「表示とアクセシビリティ」「関連アイコンと使い分け」の6セクションを記載します。SVG 原本336個は各 README と同じ `icons/<公開名>/` に収録済みです。Storybook の個別ページは README を読み込んで表示し、各個別Docsから対応する使用例にリンクします。「アイコン/使用例」の全336ストーリーはReact版の公開TIconを1つ中央に表示し、公開名は各図柄に固定、初期値は24px・currentColorです。Controlsは16・20・24・32pxと、継承・ニュートラル・7色のプライマリーのみとし、既存トークンを参照して選択をURLに保持します。Actions・Interactionsは標準パネルとして残し、イベントや表示目的のplay関数を追加しません。独自の見出し・説明・サイズ同時比較・コピー・原本ダウンロードは使用例に置きません。一覧は従来の前景・背景の組み合わせを維持します。既存画面への置き換えは未実装です。
- `tokiwagi-ui` の略称は `tkw` です。ライトモードを対象とし、7色のプライマリーを対等に扱います。
- TBrand・TIcon・TLogoの利用ルールは `components/<コンポーネント名>/README.md` が管理元です。Storybookの「コンポーネント/個別ルール」は `src/stories/component-rules/<コンポーネント名>.mdx` から原本を`?raw`で読み込み、本文を複製しません。MIT対象の公開API・利用コード・SSRなどの導入説明は `docs/wiki/Usage.md`、MIT対象外のTLogo・TBrandとCSPの説明は `docs/brand-reference.md` に保持します。アイコンやロゴ原本のルールとは役割を分けます。
- Tailwind CSS v4 の共有テーマは `tokens/tailwind.css` の `@theme inline` です。既存トークンを参照し、HEX 値を複製しません。Preflight は読み込みません。
- フォントファミリーの唯一の定義元は `tokens/typography.css`、使用ルールの管理元は `docs/typography.md`、見本はStorybookの「フォント/使用ルール」です。標準はSan Franciscoで、Apple端末のシステムフォント指定を使います。日本語と他OSは対応するシステム書体へフォールバックし、コードは等幅トークンを使います。LP・StorybookのManager／Docs／Canvas・TBrandで共通トークンを参照し、ファミリーの列挙を複製しません。フォント本体は同梱・配信しません。

## コンポーネントの命名規則

- 個別ルールのREADMEは「概要」「使用場面」「状態の表し方」「使用しない場面」「表示とアクセシビリティ」「関連コンポーネントと使い分け」の6セクションに揃えます。対応するMDXの分類は「コンポーネント/個別ルール/<コンポーネント名>」、Docs IDは`components-tbrand-rules`などとします。原本には対応する使用例と関連資料へのリポジトリ内リンクを置き、`src/stories/component-readme.ts`でStorybookの閲覧先に変換します。既存Defaultストーリーの分類・ID・Canvasは維持します。

- コンポーネントのStorybookは「コンポーネント/ドキュメントUIルール」（[管理元](src/stories/component-documentation-rules.mdx)）に従います。TIcon・TBrand・TLogoは「コンポーネント」配下のDefaultストーリーとし、bell-offの使用例と同じcenteredのCanvasに見本を1つ表示します。方式・公開名・サイズ・色・decorativeなど必要な設定だけを標準Controlsとargsで管理し、URLに保持します。方式切り替えでも他の設定を保持します。Canvasに見出し・説明・独自設定欄・枠・Props表・コード・コピー・比較・折りたたみ・関連資料一覧を置きません。色選択はTIconもbell-offと同じ継承・ニュートラル・7色の既存トークンとし、標準パネルの設定を揃えます。共通の描画・設定には`src/stories/components/component-story.ts`と`ComponentPreview.tsx`を再利用します。Astroの読み込み中・失敗・再試行は必要な場合だけ表示します。Storybook専用コードはアプリ向け公開入口からexportしません。

- ロゴのアプリ向け公開名はReact・Vue・Astroともに `TLogo` です。`src/lib/logo.ts` が原本のdata URL・許可サイズ・余白・altを共通管理します。`size`（32/64/128、既定32）は図形の幅、`decorative`（既定false）は空altへの切り替えです。外側のspanに表示幅の1/4の余白とneutral-0背景を確保するため、占有領域は幅の1.5倍です。配置用class以外の属性・イベント・children／slotは転送しません。リンクと名称は親が担います。Storybook「コンポーネント/TLogo」で公開入口の実コンポーネントを確認し、Astroは専用のBun描画スクリプトと仮想モジュールで静的出力を収録します。SVG原本・配色・汎用アイコン336種は維持します。SSR・ハイドレーションとReact 18/19の公開型も検証します。data URL用のCSPとneutrals.cssの読み込みを利用例に記載します。

- ロゴと名称のセットはReact・Vue・Astroの `TBrand` として公開します。`TLogo` をdecorativeで再利用し、内部の`TText`で`text`に指定した名称（既定「Tokiwagi UI」）を横並び・縦中央揃えで表示します。size（32/64/128、既定32）は図形幅で、配置用class以外の属性・イベント・children／slotを転送しません。書体はSan Franciscoを基準とする共通トークン `--tkw-font-family-sans`、名称は16px・太さ600・行高1.5、間隔8pxで、外側のpaddingを追加しません。内部TTextに固定のブランド設定とtone=inheritを渡し、折り返し・縮小を抑止します。text.cssの追加読み込みは不要で、読み込み済みでも寸法・親からの色継承と装飾を維持します。全幅は図形幅×1.5＋8px＋名称の実測幅、高さは図形幅×1.5です。操作と状態表示は親リンクが担い、ホームリンクには表示名に合わせたaria-label（例：`aria-label="TokiWa Calendar ホーム"`）を付けます。`text`は空白だけではない文字列に限り、HTMLとして解釈しません。Storybook「コンポーネント/TBrand」で3方式の実コンポーネントを確認し、Astroは専用の描画スクリプトと仮想モジュールで収録します。LP・既存アプリへの適用は未実施です。

- Tokiwagi UIがアプリ向けに公開するコンポーネント名は、アッパーキャメルケース（PascalCase）とし、接頭辞は `T` です。`T` に用途を表すPascalCase名を続けます。例：`TIcon`、`TButton`、`TTextField`。
- Vue・React・Astroで同じ用途を持つコンポーネントには同じ公開名を使います。フレームワークの違いはディレクトリや公開入口で区別します。
- コンポーネントを定義するファイルのベース名、exportするコンポーネント名、フレームワークで明示する登録名を揃えます。例：`TIcon.ts`、`TIcon.vue`、`TIcon.tsx`、`TIcon.astro`。コンポーネントに対応するprops型は `TIconProps` のように命名します。
- この規則はコンポーネントの命名に適用します。SVG図柄の公開名（`bell` など）や `tkw` を使う既存CSSクラス・カラートークンの命名は、それぞれの管理元に従います。

## 起動・ビルド

`tokiwagi-ui` ディレクトリで CI・Dev Container と同じ Bun 1.4.4（`packageManager` の指定）を使います。依存関係は `bun.lock` で固定します。

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
bun run test:visual      # PlaywrightのFirefox・WebKitで基準画像と比較
```

`dev:all` で Astro と Storybook の別々のローカルサーバーを同時に起動できます。個別起動には `dev` または `storybook` を使います。作業前に停止していた場合は、一時的な検証後に起動したプロセスを停止してください。外部公開と既存 Nuxt アプリへの適用は、明示的な依頼があるまで対象外です。

## 編集と検証

- カラーの見本、HEX、コントラスト比は CSS トークンの編集を Storybook の開発サーバー再起動なしで反映します。パース処理とコントラスト計算は `src/lib/palette.ts` を共有します。
- 欠落・不正な6桁HEX・重複は対象トークン名を含む日本語エラーで検出します。CSS コメントは除外し、コントラスト不足だけでは閲覧を止めません。
- 既定の前景・背景56組のコントラストを検証します。イエローの通常・ホバー・押下はユーザー指定の白文字を使う既知の例外で、通常・ホバーは大きな文字の3:1、押下は通常サイズの文字の4.5:1に不足することを検出し、見本に明記します。基準を引き下げて合格扱いにしません。他のプライマリーとライム・オレンジの通常・ホバーは大きな白文字で3:1以上、押下の白文字と全色の淡い背景の濃い文字は4.5:1以上です。ネイビーとセマンティックは4.5:1以上です。
- テストの `describe` と `test` は日本語で書き、各テストの直前に目的・条件・期待結果を記す日本語コメントを置きます。テストを変更したら `bun test` を実行します。
- 画像比較は `e2e/*.visual.ts` のPlaywrightテストとして分離します。基準画像はLinux amd64の固定Playwrightコンテナーで生成し、専用の公開リポジトリ `HikariTakahashi/tokiwagi-ui-visual-results` のRelease `visual-test-baselines` に継続保存します。PNGをGitに含めません。通常の `test:visual` は外部の承認済みZIPをSHA-256と64条件で検証して `.visual-baselines/` へ一時復元し、基準画像を更新しません。`Visual Tests` はFirefox・WebKitでReact／Vueの代表4図柄×4サイズを検証し、成功・失敗とも画像一覧・差分レポートを7日保存します。`Transfer Visual Reports` はmainのコードと保管先に限定したSecret `VISUAL_STORAGE_TOKEN` でレポートZIPを専用リポジトリのReleaseへ転送します。同リポジトリの `Publish Visual Reports` がPages公開と毎時の期限切れRelease・公開ファイル削除を行います。 同一リポジトリのPRでは転送ワークフローが公開を確認して、完了・短いコミットSHA・成功／失敗件数・日本時間の削除予定日時・クリック可能な確認画像をConversationへコメントします。結果画像をPR本文へ追加しません。転送ジョブだけに `pull-requests: write` を付与し、同じ実行の再送はbot自身のコメントを更新します。通常のPRテストへ転送用Secretを渡しません。候補生成と `Approve Visual Baselines` による外部基準の切り替えは別の手動操作です。更新・差分確認は `docs/wiki/Testing.md` に従います。実Safari・VoiceOverでの確認とは区別します。
- UI変更時は `bun run check`、`bun run build`、`bun run build:storybook` を実行し、ブラウザーでモバイル・デスクトップ表示、キーボードフォーカス、ボタンのホバー・押下を確認します。

## ドキュメントとライセンス

READMEは概要とWikiへの導線を扱います。Wiki管理ページの唯一の編集元は `docs/wiki/` です。原稿PRの `main` マージを公開判断とし、Actionsの `Sync Wiki` が追加・更新・管理対象ページの削除を自動反映します。通常更新ごとにWiki側のコミット承認を取り直しません。本体側のCodexコミット承認ルールは維持します。管理ページのWiki直接編集は次回同期で上書きされ、管理一覧にないページや画像は保持します。ページの追加・削除・改名ではHome・Sidebarなどのリンクを更新してください。ローカル保存だけでは公開完了にならず、Actions成功と公開確認までは未検証として報告します。運用・障害対応と導入状況は `docs/WIKI-PUBLISHING.md`、ライセンスの境界は `LICENSE-SCOPE.md` を参照します。ロゴ・TLogo・TBrandは掲載・exportを維持しますが、MIT対象外です。

## TSelect

React・Vue・Astroの公開入口からTSelect・TSelectProps・SelectOption・SelectOptions・SelectTone・SelectSizeとselectTones／selectSizesを公開します。`select.css`を一度読み込みます。単一選択のネイティブselectと既存TIconの矢印を使い、options・placeholder・label・description・errorを3方式で共有します。toneはneutralと7色、sizeはsm/md/lg（既定md、32/36/40px）、入力枠の角丸32pxです。対応デスクトップではCSSのbase-selectで標準pickerに選択チェックを表示し、未対応・タッチ環境では標準候補一覧を使います。独自listboxと開閉処理は追加しません。Reactはvalue/onChangeまたはdefaultValue、Vueはv-modelまたはdefaultValue、Astroはvalue/defaultValueで初期値を指定します。フォーム送信・必須検証・非制御のリセットはネイティブ動作、制御値のリセットは利用側が担当します。label・説明・エラーを一意なIDで入力へ関連付け、属性・イベント・class/styleはselectに転送します。READMEはcomponents/TSelect/README.md、APIはWikiのUsage、見本はStorybook「コンポーネント/TSelect」です。LPのカラー見本の2つの選択欄にも使用します。

## エージェント向け文書

確定事項と作業ルールは本書に集約します。`CLAUDE.md` は本書への参照のみとします。詳細なカラーの使用ルールとアイコン案は Storybook を参照してください。

## アイコン資産の編集

- 図形は `icons/<公開名>/<公開名>.svg` の原本のみを編集します。公開名、32×32のviewBox、座標、線幅、縦横比を保持します。用途・使用ルール・別名は同じディレクトリの `README.md` だけを編集し、`src/icons/<公開名>.mdx` は README を読み込む表示用ページとします。新規追加時は SVG・6セクションを持つ README・MDX を一組で作成し、件数のテスト・文書を更新してください。
- 一覧のカタログは原本から読み込み、基本・カレンダー・タスク・円枠・四角枠・三角枠に分類します。SVG本体をMDXやLPへ複製しません。
- Storybookの一覧は `.storybook/icon-search-index.ts` で原本SVGとREADMEを照合し、公開名・分類・別名・個別ページURLだけを仮想モジュールへ抽出します。別名を別の辞書へ手入力しません。READMEや原本の編集・追加・削除は開発中にも索引へ反映します。SVGは画面から200px以内に入ったカードだけが既存の `/icon-assets` から個別取得し、成功・取得中のデータを共有、失敗時はカード外のボタンで再試行します。LP用のサーバー側カタログと個別DocsのREADME読み込みは維持します。容量の計測方法と変更前後の結果は `docs/icon-browser-loading.md` に記録します。
- Storybook の原本ダウンロードは `icons/` を `/icon-assets` に静的配信します。README の `?raw` 読み込みと静的配信のURLを重ねないでください。
- 表示変換は黒い線・塗りのcurrentColor化と表示サイズ、アクセシビリティ属性、クリッピングIDの一意化に限定します。`fill="none"`、白いクリッピング、線幅の差異は保持します。
- SVG収録済みという状態と使用ルールの確定状況は別々に記載します。`bell` 以外の詳細ルールを一括で確定扱いにしません。
- Vue・React・Astro共通の公開名・原本importは `bun run generate:icons` で `src/lib/icon-sources.ts` に生成します。追加・削除時に実行し、同じコマンドで `src/stories/icon-examples/*.stories.ts` の使用例も原本カタログから生成します。生成ファイルを手編集しません。Vueの既存ファイルは共通データを再exportします。Vue 3.5以上の `useId()` でSSR対応のIDを作り、装飾SVGの読み上げ属性を固定します。複数Vueアプリを同じ文書に置く利用側は `app.config.idPrefix` を分けます。
- React 18・19向けの `TIcon` は `name`・`size`・`color`・`className` だけを公開します。追加属性・イベント・children・refは転送せず、読み上げ属性を固定します。Reactの `useId()` を符号化したReact専用接頭辞でIDを生成します。複数rootでは `identifierPrefix` を分け、SSRとクライアントで同じ値を使います。意味・操作名は併記テキストと親のbutton/linkが担います。React変更時は `bun run check:react-compat` も実行します。
- Astro向けの `TIcon` は `name`・`size`・`color`・文字列の `class` を公開します。追加のSVG属性・イベント・slotは転送せず、装飾SVGの読み上げ属性・viewBox・サイズを固定します。意味は併記テキスト、操作名は親のbutton/linkが担います。IDは描画時に `crypto.randomUUID()` で生成し、静的HTMLに保存します。ハイドレーションは不要です。Astro変更時は全336種×4サイズの実コンポーネント描画を検証します。
- UI変更時の必須検証に加え、全原本との一致、線と塗りの着色、moon/toolの同時表示、一覧の検索・分類、使用例のControlsによるサイズ・色変更とURLの再読み込み、個別Docsからの遷移を確認します。色の検証には既存のトークンを使います。

## ヘッダー部品

- `THeader`・`THeaderSection`・`THeaderButton`・`THeaderLink`・`THeaderButtonGroup`をReact・Vue・Astroの同名APIで公開します。利用側で`tokiwagi-ui/header.css`を一度読み込み、既存トークンを参照する高さ36pxの1行ヘッダーを表示します。幅不足時は内部を横スクロールし、操作の省略・メニューへの集約はアプリ側で決めます。
- `THeader`は全体の背景・横スクロール、`THeaderSection`は必須position（left/center/right）による配置、`THeaderButton`はtone（neutralと7色）、iconOnly・selected・disabled、`THeaderButtonGroup`は境界線とrole=groupを担います。クリックによる選択変更や日付計算は内包しません。ブランド表示は利用側から渡し、既存TBrand・TLogoは変更しません。
- 5部品はネイティブ属性とslot／children、React・Vueのネイティブイベントを転送します。Astroは利用側scriptで操作を接続します。スクロール領域とボタンのフォーカスは36pxの領域内で見えるようにし、アイコンのみの操作名とグループの読み上げ名は利用側で指定します。
- ヘッダー5部品のDefaultはStorybookの「コンポーネント/ヘッダー」配下にまとめ、既存のストーリーID・URLを維持します。個別ルールは「コンポーネント/個別ルール」に保持します。Defaultは標準Controlsから方式・色・状態を変更します。THeaderはFigmaに基づく合成例を1つ表示し、Astroも公開部品の実描画をJSONとして収録します。THeaderButtonのControlsはcontent（文字のみ／アイコンのみ／文字＋アイコン）・text・全336種のiconを指定でき、アイコンのみではtextを読み上げ名に使います。Astroは実ボタンの状態別テンプレートと実TIcon出力を組み合わせ、文言はtextContentとして扱います。日本語などの文言もtextcodeでURLへ保存・復元します。利用ルールは各README、導入説明は`docs/wiki/Usage.md`を原本とします。

- THeader直下はTHeaderSectionをleft→center→rightの順に各1つまで配置し、不要な領域は省略できます。start/end props・名前付きslotは廃止しました。左右は内容幅、中央は残り幅の中央へ揃えます。中央なしでもrightは右端へ、中央のみなら全幅の中央へ配置します。DOMやフォーカスの順序をCSSで並べ替えません。THeaderSectionのDefaultは親THeader内に1つ表示し、方式・positionをControlsで変更してURLに保持します。

- THeaderのbackgroundColorは既存の全93カラートークン名（既定`--tkw-color-neutral-0`）を受け取り、HeaderBackgroundColor型とheaderBackgroundColors一覧を3方式から公開します。4つの原本CSSと共通コントラスト計算から継承文字色・通常ボタンの前景を4.5:1以上に調整します。THeader内の通常ボタン背景は透明、状態表示は既存の背景・前景の組を維持します。StorybookはbackgroundColorをControlsとURLに保持し、Astroの背景外枠93件と既存の状態見本を合成して表示します。独自CSSで固定した子要素の色や利用側のトークン上書きは利用側で確認します。

- `THeaderLink`はhref必須のa要素で、THeaderButtonと同じCSS・tone・iconOnlyを共有します。空のhrefは日本語エラー、現在地はaria-currentで指定し下線を表示します。selected・disabledは提供しません。target=_blankではrelのopenerを除きnoopenerを補完し、他のrelは保持します。THeaderButtonGroupはボタンとリンクの混在に対応します。Storybookは「コンポーネント/ヘッダー/THeaderLink」で標準Controlsによる方式・tone・content・text・icon・href・target・aria-currentを扱い、textとhrefの日本語・記号もURLへ保持します。Astroの実リンクテンプレートにDOM APIで文言と属性を反映します。ルーター連携・現在URLの判定は利用側の責任です。

- THeaderButton・THeaderLinkのactiveはboolean（既定false）で背景と3pxの下線を表示し、aria-pressed・aria-currentを変更しません。押下中（CSSの:active）も下線を表示し、離すと元へ戻ります。既存selected／aria-currentの下線は維持します。disabledは押下表示を抑止し、明示状態の下線は無効色です。Storybookの両部品にactive Controlsを置き、Astroの実状態テンプレートも収録します。

## TText

React・Vue・Astroの公開入口からTText・TTextPropsとTextOptions等の共通型を公開します。利用側で`tokiwagi-ui/text.css`を一度読み込みます。書体・色は既存トークンを参照し、サイズはsm/md/lg（0.875/1/1.125rem）、既定md、行高1.5、太さnormalです。asはspan/p（既定span）、toneはdefault/muted/inherit/success/warning/error/infoです。sizeはbaseを必須とするオブジェクトでも指定でき、640pxのsm・1024pxのlgへ直前の値を引き継ぎます。inheritは書体・サイズ・太さ・行高を親から継承し、明示設定を優先します。色の継承はtoneで指定します。truncateとlineClampは併用を拒否します。文字列・children/slot・標準属性を保持し、見出し・操作・全文表示の導線は利用側が担います。利用ルールは`components/TText/README.md`、APIはWikiのUsage、見本はStorybook「コンポーネント/TText」です。Astroの見本は公開実コンポーネントのspan/p出力を収録し、共通解決処理の属性・CSS変数とtextContentで入力を安全に反映します。

## TButton

React・Vue・AstroのTButtonにsize（sm/md/lg、既定lg）と任意のleadingIcon・trailingIconを指定します。ButtonSize・buttonSizes・ButtonOptionsも各公開入口から利用できます。文字1.25/1.5/1.75rem、TIcon20/24/32px、最小高さ40/44/50px、左右padding12/14/16px、gap6/8/10pxを連動させ、縦padding6px・角丸32pxを維持します。lgのアイコン外枠40×32px、sm/mdの20×20px／24×24pxも保持します。寸法解決はsrc/lib/button-size.ts、サイズCSSはbutton.cssでTLinkButtonと共有し、リンク側の公開型・角丸12px・a要素の動作は維持します。不正サイズと未登録の前後アイコン名は日本語エラーです。ネイティブbuttonのtype・disabled・フォーム属性・イベント・children/slotとSSRを維持します。Storybookはsizeと前後アイコンを標準Controls・URLに保持し、Astroも実部品とサイズ別の実TIcon出力を使います。利用ルールはcomponents/TButton/README.md、APIはdocs/wiki/Usage.mdに保持します。

TButton・TLinkButtonのtoneは共通のButtonTone・buttonTonesで、既存neutralと7色にneutral-0/600/800/900を追加します。通常・ホバー・押下・前景のneutral段階は順に0/100/200/900、600/800/900/0、800/900/1000/0、900/800/1000/0です。既存neutralの100/200/400/900と無効状態を維持します。1000は押下時の最大強調に限定し、トークンの値・個数を変えません。TLinkButtonはリンク共通処理とは別にbuttonToneStateでtoneを検証し、本文用TLinkのLinkTone・linkTonesはneutralと7色のままです。Storybookの両部品はbuttonTonesをControlsに使い、方式切替・URL復元でも追加色を保持します。配色表はcomponents/TButton/README.md、APIはdocs/wiki/Usage.mdに保持します。

TButton・TLinkButtonのweightはTTextと共通のTextWeight型（normal/medium/semibold/bold＝400/500/600/700）です。未指定時はfont-weight:inheritで親から継承し、文字列inherit・数値は受け付けません。従来の700固定から変わり、以前の太字が必要な箇所はweight="bold"を指定します。3方式で同じ共通検証とdata-weight・button.cssを使用し、size・現在地・無効状態とは独立して解決します。Storybookの両部品に未指定（継承）と4段階のweight Controlsを置き、方式切替・URL復元を保持します。

## TLink

React・Vue・Astroの公開入口からTLink・TLinkPropsとLinkTone・LinkOptions・LinkCurrent・linkTonesを公開します。href必須のネイティブa要素で、未指定・空文字・空白のみは日本語エラーです。tokiwagi-ui/link.cssを一度読み込み、周囲の書式を継承した下線付きの本文リンクを表示します。toneはneutral（既定）と7色のプライマリーで、文字とアイコンは既存のneutral-900／on-subtleトークンを参照します。leadingIcon・trailingIconは任意の16px装飾TIconです。現在地はaria-currentで指定し、太字と太い下線で表します。target=_blankのrelはopenerを除いてnoopenerを補完します。属性・children/slot・React/Vueのネイティブイベントを転送し、ルーター・URLの検証と決定・現在地判定は利用側が担います。disabledは提供しません。利用ルールはcomponents/TLink/README.md、APIはWikiのUsage、見本はStorybook「コンポーネント/TLink」です。Astroも実リンク・実TIconの出力を使い、Controlsの文言と属性をDOM APIで反映します。

## TLinkButton

React・Vue・Astroの公開入口からTLinkButton・TLinkButtonPropsを公開します。href必須のa要素で、リンクの共通検証・target=_blankのrel補完・現在地解決はTLinkと同じlinkStateを使います。link-button.cssはTButtonのCSSを読み込み、高さ50px以上・文字1.75rem・前後の32px装飾TIcon・ニュートラル5種類と7色を共有します。角丸は現在の12pxで、TButtonの32pxを維持します。現在地のaria-currentではラベルに下線を表示します。native属性・React/Vueイベント・children/slotを転送します。disabledはboolean（既定false）でTButtonと検証・無効色・影・カーソル・ホバー/押下抑止を共有します。無効時はhrefなどのリンク属性・フォーカス属性・操作ハンドラーを除き、role=link・aria-disabled=trueを出力してTab移動から外します。hrefはpropsとして必須で、再有効化時に元の属性・イベントへ戻します。React・Vueはクリック系と起動キーの伝播も抑止し、Astroもscriptなしで遷移しません。Vueのautofocusは公開型と推論型で指定できます。StorybookのDefaultは「コンポーネント/TLinkButton」に実部品1つを表示し、framework/text/href/tone/leadingIcon/trailingIcon/disabled/target/rel/aria-currentをControlsとURLで保持します。Astroは実リンクと実32pxTIconの出力を使います。利用ルールはcomponents/TLinkButton/README.md、導入/APIはdocs/wiki/Usage.mdです。

## リンクのサイズ

TLinkのsizeはinherit（既定）/sm/md/lgで、文字は継承/0.875/1/1.125rem、TIconは16/16/16/20pxです。TLinkButtonのsizeはsm/md/lg（既定）で、文字1.25/1.5/1.75rem、TIcon20/24/32px、最小高さ40/44/50px、左右padding12/14/16px、gap6/8/10pxを連動させます。縦padding6px・現行の角丸と色は維持します。リンクの型とアイコン寸法はsrc/lib/link-size.tsを入口とし、ボタン型のサイズ定義はsrc/lib/button-size.tsを共有します。文字や余白はTLinkのlink.cssと、TButton・TLinkButton共通のbutton.cssに保持し、link-button.cssは角丸と現在地の差分を扱います。各公開入口からLinkSize・LinkButtonSize・linkSizes・linkButtonSizes・LinkButtonOptionsを公開します。サイズ未指定の既存表示は維持し、未定義値（ボタン型のinheritを含む）は日本語エラーにします。Storybookの両部品にsize selectを追加し、方式切替・URL復元・Astro実出力のサイズ連動を検証します。
