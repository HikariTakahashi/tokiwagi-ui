---
name: component-creator
description: Tokiwagi UIのアプリ向け再利用可能なUIコンポーネントを新規作成するときに使う。AGENTS.mdの命名規則に沿って、公開API・既存資産の利用・アクセシビリティ・利用例・検証を整える。アプリ画面への既存コンポーネントの適用や、Storybook資料だけの作成には使わない。
---

# コンポーネント作成

対象は `HikariTakahashi/tokiwagi-ui`。規則の管理元は [AGENTS.md](../../../AGENTS.md) とし、[issue-to-pr](../issue-to-pr/SKILL.md) の実装フローと併せて使う。

## 名前と対象を決める

- `AGENTS.md` の「コンポーネントの命名規則」を適用する。用途に合わせて `TIcon`、`TButton` などの公開名を決め、実装ファイル・export・登録名・対応するprops型を揃える。
- 依頼されたフレームワークと利用場面を確認する。既存実装と公開入口を調べ、Vue・React・Astroのうち対象となる方式だけを実装する。複数方式を依頼された場合は、同じ用途の公開名と意味を揃え、フレームワーク固有のprops・イベント表現は各方式に合わせる。
- 同じ用途のコンポーネントが既にある場合は重複を作らず、再利用や拡張で依頼を満たせるか確認する。既存APIの改名や互換性変更が必要な場合は、依頼された範囲と利用箇所を確認する。

## 実装と公開APIを整える

- propsの型・既定値・許可する値・不正値の扱いを定める。必要なイベント・slot・childrenと、classや属性の転送範囲を明確にする。親の責任とコンポーネントの責任を分け、公開APIを利用例で示す。
- 対象となる `src/react/`、`src/vue/`、`src/astro/` に実装と `TNameProps` を追加し、各 `index.ts` からコンポーネントと公開型をexportする。複数方式で共通の既定値・状態判定・入力検証が必要なら `src/lib/` で共有する。アプリ向けの入口からStorybook資料用コードやREADME本文を読み込まない。新しいフレームワークの実装では、依存関係・ビルド・型検査がその方式を扱えることを確認する。
- 色は `tokens/` の既存トークンを参照する。コンポーネント内に色値を複製しない。状態に応じた背景と前景の組み合わせは、Storybookのカラー使用ルールに従う。
- 専用CSSが必要なら `src/styles/<name>.css` を追加する。利用側が `tokiwagi-ui/<name>.css` から読み込めるよう `package.json` の `exports` に登録し、Storybookの見本で使うCSSは `.storybook/preview.ts` でも読み込む。
- アイコンを使う場合は公開済みコンポーネントを再利用する。アイコンコンポーネント自体を作る場合は `icons/` のSVG原本と既存の表示変換を使い、`AGENTS.md` のアイコン資産の規則に従う。
- 外部SVGなどの第三者素材を同梱する場合は、必要なライセンス通知を素材とともに保存し、[第三者ライセンス資料](../../../docs/THIRD-PARTY-LICENSES.md)に出典を記録する。
- 操作要素の読み上げ名、キーボード操作、フォーカス、無効状態を設計する。装飾アイコンは重複読み上げを避け、アイコンだけの操作には親のbutton/linkに目的が分かる名前を付ける。状態を色だけで伝えない。
- 描画IDを使う場合は複数インスタンスで衝突しないようにする。SSRを対象とする方式では、サーバー描画とクライアントのハイドレーションでIDが一致する方式を使う。

## Storybookの見本を追加する

- [コンポーネントプレビューのUIルール](../../../src/stories/component-documentation-rules.mdx)を読み、`src/stories/TName.stories.ts` にCSFストーリーを追加する。単体部品の `title` は `コンポーネント/TName`、ヘッダー・サイドバーの部品は `コンポーネント/ヘッダー` または `コンポーネント/サイドバー` とする。同じ `title` の直下にDocs、部品名のストーリーの順に並べる。
- 新規ストーリーの `id` は `components-tname` の形式にし、`Default` をexportして `name` に部品名を指定する。既存ストーリーを移動する場合も明示IDと `Default` を保ち、既存の `--default` URLを引き継ぐ。
- [共通描画](../../../src/stories/components/component-story.ts)と [ComponentPreview](../../../src/stories/components/ComponentPreview.tsx)を再利用する。`!autodocs` を指定し、centeredのCanvasには公開入口の実コンポーネントの見本を1つ表示する。Canvasに説明・独自設定欄・枠・Props表・コード・コピー・比較・折りたたみ・関連資料一覧を置かない。
- 設定は標準Controlsとargsで管理する。初期値は実コンポーネントの既定値に合わせ、必須propsには代表値を選ぶ。対応する方式をReact・Vue・Astroの順に並べ、方式切り替えとURL再読み込みで設定を復元する。追加したControlsと初期値をUIルールの一覧に反映する。
- Astro版の見本は、`scripts/render-astro-*-previews.ts` と `.storybook/astro-*-previews.ts` の既存例に合わせて公開入口の実コンポーネントを描画し、JSONで収録する。依存ファイルの監視、`.storybook/main.ts` へのプラグイン登録、`src/stories/astro-previews.d.ts` の仮想モジュール宣言、共通ローダーとの接続を行う。

## Docs・利用例・紹介ページを整える

- 利用ルールの原本は `components/TName/README.md` とし、「概要」「使用場面」「状態の表し方」「使用しない場面」「表示とアクセシビリティ」「関連コンポーネントと使い分け」の6セクションに揃える。READMEに「使用例を見る」と関連資料へのリポジトリ内の相対リンクを置く。
- 単体部品は `src/stories/component-rules/TName.mdx` から原本を `?raw` で読み込み、ストーリーと同じ `title` と `components-tname-rules` 形式のDocs IDを指定する。グループ部品は共通DocsのMDXから原本を `?raw` で読み込み、[ComponentGroupRules](../../../src/stories/ComponentGroupRules.tsx) の `readmes` に追加して部品ごとの見出しと目次を表示する。既存の部品別Docsを統合するときは、旧MDXに `!dev` を指定して従来のURLから開けるようにする。
- [リンク変換](../../../src/stories/component-readme.ts)に見本と利用ルールの閲覧先を登録する。グループ部品の利用ルールへのリンクは共通Docsの部品見出しを指す。同じDocs内ではページ内リンクにする。アイコンやロゴ原本のルールは各管理元を参照する。
- MIT対象の公開API・インポート方法・CSSの読み込み・方式別の利用コード・必要なSSRの説明は `docs/wiki/Usage.md` に記載する。MIT対象外のTLogo・TBrandとCSPなどの説明は `docs/brand-reference.md` に保持し、`LICENSE-SCOPE.md` の境界を維持する。利用説明のAstroへの移設は依頼に含まれる場合に扱う。
- `/components/` への掲載対象なら `src/pages/components.astro` を更新し、分類・使いどころ・公開Astro版の見本と必要なCSSを追加する。見本とDocsへのリンクを設け、グループ部品のDocsは共通Docsの該当見出しへ案内する。

## 検証する

- 対応する方式の公開入口からインポートし、公開型と、既定値・不正値・状態・イベント・属性転送など必要な動作を検証する。対象方式に応じてSSR・ハイドレーションと複数インスタンスも確認する。React版の `.typecheck.tsx` を `scripts/check-react-compat.ts` の対象に追加し、`bun run check:react-compat` でReact 18・19を確認する。テスト名と目的・条件・期待結果のコメントは日本語で書く。
- `src/stories/component-rules.test.ts` と `src/stories/components/component-stories.test.tsx` の対象を更新する。READMEの6セクション、Docsと見本の配置・表示名、共通Docsへの収録、相対リンクとStorybook上のリンク、該当する旧URLを確認する。グループに新規部品を追加する場合は、共通Docsへの収録をテストし、既存部品の旧URLも検証対象に残す。
- UI変更時は `bun run check`、`bun test`、`bun run build`、`bun run build:storybook`、`bun run test:storybook` を実行する。ブラウザーで390px・1440pxの表示、キーボードフォーカス、操作要素のホバー・押下、Docsが先頭に並ぶこと、目次と関連リンクの遷移、本文・表の横はみ出し、Controlsの操作とURL復元を確認する。紹介ページに掲載した場合は実見本とリンクも確認する。
- Astro見本は開発時の再生成と静的Storybookの表示、非同期読み込み中・失敗・再試行を確認する。該当する方式切り替え・離脱時のReactとVueの解放、AstroのID分離と色継承も確認する。
- 変更内容、公開API、利用方法、検証結果と残る制約をまとめ、コミット・PRは `issue-to-pr` の手順に従う。
