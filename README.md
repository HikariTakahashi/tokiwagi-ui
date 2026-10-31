# Tokiwagi UI

Tokiwagi UIは、予定やタスクを通じて人と人の時間、今日と明日をつなぐ「TokiWa Calendar」のために開発しているデザインシステムです。「『とき』を繋ぎ、共に続く『わ』を。」というフィロソフィーを土台に、季節を越えて緑を保つ「ときわぎ（常盤木）」のように、日々の暮らしの中で永く使い続けられる体験を目指しています。

色・アイコン・UIコンポーネントと、その選び方や使い分けを共通の基盤として整理しています。7色のプライマリーカラーを対等に扱い、同じ対象には同じ色を、同じ状態には一貫した意味を持たせることで、画面が変わっても操作の手がかりがそろうようにします。また、状態を色だけで伝えず、文言やアイコンと組み合わせ、利用者が意味を理解しやすい表現を大切にしています。

React・Vue・Astro向けのコンポーネント、共有カラートークン、Storybookの見本と利用ルールを通じて、デザイナーと開発者が同じ判断基準を参照しながら設計・実装を進められるようにします。部品とルールを継続して整え、予定の確認やタスクの管理といった日々の操作に一貫性を持たせることで、TokiWa Calendarが目指す、暮らしの中で続いていくつながりを支えます。

## 主な機能

- React・Vue・Astro向けの装飾用コンポーネント `TIcon` と329種の汎用SVG。
- ライトモード向けの93カラートークンとTailwind CSS v4の共有テーマ。
- San Franciscoを基準とする[共通フォントルール](docs/typography.md)とフォントトークン。
- Storybookによるカラー・アイコン・コンポーネントの見本と利用ルール。
- Astroによる紹介ページ。ブランド部品 `TLogo`・`TBrand` も実装済みですが、MIT対象外です。

npm公開・配布用ビルドは未実施です。現状はソースを含むローカルパッケージとして利用します。既存Nuxtアプリへの置き換えは未実施です。

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| 言語 | TypeScript 5.9.3、CSS、MDX、SVG |
| 紹介ページ | Astro 7.3.4 |
| コンポーネント | React `^18.0.0 \|\| ^19.0.0`、Vue 3.5以上（4未満）、Astro |
| スタイル | Tailwind CSS 4.3.3、CSSカスタムプロパティ |
| ドキュメント | Storybook 10.6.0、GitHub Wiki |
| 開発・テスト | Bun 1.3.9、Bun Test、Happy DOM、Astro Check、Playwright（画像比較） |

## 環境構築・使い方・テスト

詳細は公開済みの[GitHub Wiki](https://github.com/HikariTakahashi/tokiwagi-ui/wiki)で管理します。下記の各ページから環境構築・使い方・テスト方法を確認できます。Wiki原稿は `docs/wiki/` に保持します。

| 内容 | Wiki | ローカル原稿 |
| --- | --- | --- |
| 目次 | [Home](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Home) | [Home](docs/wiki/Home.md) |
| 環境構築・開発環境 | [Setup](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Setup) | [Setup](docs/wiki/Setup.md) |
| コンポーネントの使い方 | [Usage](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Usage) | [Usage](docs/wiki/Usage.md) |
| テスト方法 | [Testing](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Testing) | [Testing](docs/wiki/Testing.md) |

[Wikiの反映状況と更新手順](docs/WIKI-PUBLISHING.md)も参照してください。

## 開発参加

開発担当者、Issue・ブランチ・Pull Requestの運用は [Contributing](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/Contributing)（[ローカル原稿](docs/wiki/Contributing.md)）を参照してください。

## ライセンス

[適用範囲](LICENSE-SCOPE.md)に定める自作コード・汎用SVG・トークン・文書は **MIT License** です。商用利用・改変・再配布が可能です。正式な全文は [LICENSE](LICENSE)、説明は [WikiのLicense](https://github.com/HikariTakahashi/tokiwagi-ui/wiki/License)（[ローカル原稿](docs/wiki/License.md)）を参照してください。

**ロゴ・TLogo・TBrandとその専用ファイルはMIT対象外です。** 掲載やexportは利用許諾を意味しません。[ブランド参照資料](docs/brand-reference.md)と[第三者ライセンス](docs/THIRD-PARTY-LICENSES.md)を確認してください。
