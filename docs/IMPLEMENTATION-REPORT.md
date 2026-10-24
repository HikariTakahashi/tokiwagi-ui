# 文書・ライセンス整備の実施報告

確認日：2026年10月24日。対象：[HikariTakahashi/tokiwagi-ui](https://github.com/HikariTakahashi/tokiwagi-ui)。関連作業は[Issue #49](https://github.com/HikariTakahashi/tokiwagi-ui/issues/49)（種別: 残タスク、重要度: 中）で管理します。

## 作成・変更したファイル

| 区分 | ファイル | 内容 |
| --- | --- | --- |
| 変更 | [README.md](../README.md) | 概要、実装済み機能、技術スタック表、Wiki導線、開発参加、ライセンス |
| 新規 | [LICENSE](../LICENSE)・[LICENSE-SCOPE.md](../LICENSE-SCOPE.md) | MIT正式全文とブランド・第三者著作物の適用境界 |
| 新規 | [Wiki原稿](wiki/Home.md) | Home・Setup・Usage・Testing・Contributing・License・_Sidebarの7ファイル |
| 新規 | [brand-reference.md](brand-reference.md) | 既存READMEのTLogo・TBrand説明・利用例を保存。MIT対象外 |
| 新規 | [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md) | 直接・間接依存、通知の所在、SVG・フォントの確認結果 |
| 新規 | [WIKI-PUBLISHING.md](WIKI-PUBLISHING.md) | Wiki7原稿の未反映状態と、初期化・取得・統合・公開の手順 |
| 新規 | [IMPLEMENTATION-REPORT.md](IMPLEMENTATION-REPORT.md) | 本報告 |
| 変更 | [AGENTS.md](../AGENTS.md) | Wiki・ブランド資料・ライセンスの管理場所を更新 |
| 変更 | [component-creatorスキル](../.agents/skills/component-creator/SKILL.md) | 公開APIと利用説明の記述先を更新 |

アプリのソースコード、公開API、SVG原本、トークン値、テスト、依存関係、ロックファイルは変更していません。既存READMEの説明は移設して保持し、資料の管理場所や公開状況が変わった記述のみ補正しています。

## README・Wiki・LICENSE

READMEは「プロジェクト概要」「主な機能」「技術スタック」「環境構築・使い方・テスト」「開発参加」「ライセンス」の構成です。詳細はWiki原稿へ分離し、未反映の間もローカルで読めるリンクを置きました。

Wikiは7原稿すべて準備済みですが、GitHub Wikiへの反映はすべて未実施です。APIの `has_wiki: true` は確認できましたが、Wiki Gitリポジトリの取得は `Repository not found` でした。既存ページの取得・統合と公開ページでのリンク遷移は未検証です。

LICENSEは正式なMIT全文、表示は `Copyright (c) 2026 Hikari Takahashi` です。MIT本文に独自の制限を追記していません。別文書で49ファイルのブランド除外と共有ファイル内のブランド表現を指定しています。TLogo・TBrandの掲載・export・見本は維持しています。

## 検証結果

| 項目 | 結果 |
| --- | --- |
| `bun test` | 成功：27ファイル、93件成功、0件失敗 |
| `bun run check` | 成功：416ファイル、エラー・警告・ヒントすべて0 |
| `bun run check:react-compat` | 成功：React 18.3.1・19.3.0のそれぞれで公開型、SSR、ハイドレーション等を検証。各17件成功 |
| `bun run build` | 成功：Astroの1ページを `dist/` へ出力 |
| `bun run build:storybook` | 成功：`storybook-static/` へ出力。大きいチャンクとビルド処理時間の警告・案内あり |
| Markdown構造・リンク・移設内容 | 成功：見出し・表・コードフェンス、ローカル／Wiki参照先と原稿を照合 |
| READMEのHTMLプレビュー | 成功：ローカルのHTMLプレビューで見出し・表・リンクを表示し、Usageへの遷移を確認 |
| MIT正式本文の照合 | 著作権行以外を既存依存VueのMITと照合し、空白差を除いて一致 |
| スキル検証 | 標準quick_validate.pyはPyYAML不足で起動不可。既存YAMLパーサーで同等のメタデータ・雛形検査を実施し成功 |
| `git diff --check` | 成功 |
| ソース・依存・APIの差分 | 変更対象が文書とライセンスのみであることを確認 |
| GitHub Wiki上の表示・Sidebar・READMEからの遷移 | 未検証：未初期化の可能性と公開承認待ちのため |
| クリーン環境での依存導入、開発サーバー起動・アプリの操作確認 | 未実施。既存のインストール済み環境で検証し、コマンドとURLは設定と照合。UIの変更はなし |

### 文書検証

15件のMarkdownをGFM対応パーサーで読み取り、102リンク（うちWikiリンク23件）、16表、22コードブロックの構造・参照先と見出し階層を点検しました。旧READMEのコードブロック15個のうち14個はそのまま保存し、起動手順の1個はclone・依存導入・サーバー起動へ分けて、各コマンドが残っていることを確認しました。ブランド除外49ファイルの実在、bun runコマンドとpackage.jsonの対応も照合しました。

BunのMarkdownレンダラーで一時HTMLを生成し、ブラウザでREADMEの表・見出し・導線とUsageのコード表示を確認しました。プレビュー内のWikiリンクはローカル原稿へ置き換えています。これはGitHub上のWiki公開・Sidebar表示の確認ではありません。確認用の一時サーバーは確認後に停止しました。

### 秘密情報・公開対象外情報の点検

調査開始時のHEADは `8aca11d5f1bbaab96a975a6e3f6fe2dfba1f2718`。ローカルの全参照から到達できる68コミット・3,280個のblobと、既存の追跡ファイル1,453件を対象に確認しました。

- GitHub・AWS・Google・Slackの代表的なトークン形式、秘密鍵ヘッダー、長い固定値を伴う資格情報の代入パターンは検出されませんでした。
- `.env`、秘密鍵、credentials等の代表的なファイル名は、対象の追跡ファイル・履歴で検出されませんでした。
- `internal`・`private`・`confidential` という典型的なディレクトリ名は、追跡ファイルにありませんでした。利用API・構成・既存資料を調べ、ロゴ・TLogo・TBrandは削除対象ではなく、合意した掲載継続・MIT対象外として扱いました。
- 新しく作成した文書にも、実際の資格情報や個人用のローカル絶対パスを掲載していません。

これは取得済み履歴と特定の検出形式・確認範囲による点検です。任意の秘密形式、リモートのみの参照・削除済み参照・到達不能オブジェクト、未申告の内部情報まで存在しないことを保証するものではありません。履歴書き換えや非公開リポジトリの履歴の複製は行っていません。

### 第三者著作物

インストール済み432組のパッケージ名・バージョンの宣言を集計しました。直接依存は主にMIT、TypeScriptはApache-2.0です。間接依存にはMPL-2.0のLightning CSS、LGPL-3.0-or-laterのsharp用libvipsなどもあります。個々の条件・通知・同梱ライブラリと未確認事項は[調査結果](THIRD-PARTY-LICENSES.md)に記載しました。MITのみの依存構成とは報告していません。

## 未確認事項・残作業

- SVGのGit収録以前の制作履歴と外部素材流用有無の資料。MITの適用はユーザーによる権利者確認に基づきます。
- 追加の開発メンバー、担当領域、正式なレビュー担当者。
- 未インストールのプラットフォーム別optional依存、ネイティブバイナリ内の依存・通知、将来の配布物に必要な通知全文の照合。
- Wikiの初期化状況と既存ページ。承認後に権限のあるアカウントで初回Home作成の要否を確認します。
- 本体の変更はユーザーのPR作成指示に基づき、ライセンス・Wiki・README・エージェント手順・実施報告の5コミットに分けてPRへ提出する運用としました。Wikiの初期化・公開は未実施です。リポジトリの公開設定は変更していません。

## GitHubで必要な操作

[Wiki更新手順](WIKI-PUBLISHING.md)に沿い、文書・ライセンスの差分レビューと承認後に実施します。未初期化ならGitHubでHomeを初回作成し、Wikiを別Gitリポジトリとして取得します。既存内容を統合した後に承認済みのコミット・pushを行い、公開ページの表示・全リンク・Sidebarを検証します。

本体側はPR経由で `main` へ反映し、Wikiから参照するLICENSE・適用範囲・参照文書を先に閲覧可能にします。Wiki公開を確認したらREADMEと反映状況表を更新します。Wikiが使えない場合も原稿は残し、未反映の状態を継続して明記します。
