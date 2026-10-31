# アイコン一覧の読み込み量

Issue: [#12](https://github.com/HikariTakahashi/tokiwagi-ui/issues/12)

## 読み込み方式

Storybook専用の `.storybook/icon-search-index.ts` が、ビルド時に原本SVGとREADMEを既存の `createIconCatalog` で照合する。ブラウザーへ渡す仮想モジュールには、公開名・6分類・READMEの「概要」から抽出した別名・個別DocsのURLだけを含める。SVGとREADME全文は含めない。別名の管理元は引き続き `icons/<公開名>/README.md` だけで、生成ファイルの手編集や追加の生成コマンドは不要。開発時はREADME・SVGの編集、追加、削除を監視して再生成する。

一覧のカードが画面から200px以内に入った時に、既存の静的配信先 `./icon-assets/<公開名>/<公開名>.svg` から原本をfetchする。各SVGが独立した取得単位なので、画面外の全原本を初期JavaScriptへまとめない。検索と分類は全329件の軽量索引に対して行い、読み込み前の図柄も検索できる。取得中・成功した原本はページ内で共有し、色・サイズ変更や絞り込み解除時に再取得しない。失敗はキャッシュせず、カードの外に表示する再試行ボタンで復旧できる。

表示変換、6分類、前景と背景のトークン、サイズ、個別Docsへのリンク、原本URLは既存の関数を再利用する。Astro LPのビルド時カタログと個別DocsのREADME全文の読み込みには変更を加えない。公開TIcon・TLogo・TBrandの配信方式も変更しない。

## 容量比較

2026-10-31、macOS arm64、Bun 1.3.9、Node.js 22.16.0、固定済みの `bun.lock` で計測。変更前は `main` の `1f6af13`。Issue作成時からビルダーとチャンク分割が変わっているため、Issue本文の約1.36 MBをそのまま比較対象とせず、同じ環境で変更前後を再ビルドした。

| 計測対象 | 変更前 | 変更後 |
| --- | ---: | ---: |
| 一覧DocsのエントリーJS | 58,762 B | 70,891 B |
| 同gzip | 15,889 B | 9,303 B |
| 静的importを含むJS合計 | 3,273,736 B | 1,921,395 B |
| 各JSをgzipした合計 | 1,143,695 B | 548,287 B |
| 初期読み込みJSファイル数 | 348 | 18 |
| うちREADMEチャンク | 330 | 0 |

初期JS合計は **41.3%減**、各JSのgzip合計は **52.1%減**。エントリー単体の未圧縮サイズは索引を直接含める分だけ増えるが、従来そこから静的importしていたREADME・SVGを含むチャンクが外れるため、実際に必要なJS合計は減る。合計には共通のStorybook Docs・Reactランタイムを含む。gzip値はBunの `node:zlib.gzipSync` によるファイルごとの圧縮後サイズの合計で、HTTPヘッダーやSVG転送量は含めない。ビルド時のチャンクハッシュなどにより、gzip値には数十B程度の差が生じることがある。

## 再計測

```sh
bun run build:storybook
bun scripts/measure-icon-browser.ts
```

`scripts/measure-icon-browser.ts` はBunのJavaScriptパーサーで一覧Docsの静的importを再帰的に辿り、同じチャンクを一度だけ集計する。動的import先の個別Docs・使用例、別途取得するSVG、CSS、JSONは初期JSへ含めない。別のビルド成果物を計測する場合はassetsディレクトリを渡す。

```sh
bun scripts/measure-icon-browser.ts /path/to/baseline/storybook-static/assets
```

SVGはJavaScriptと別に、閲覧位置と検索結果に応じて取得する。全件までスクロールすれば全329原本を取得するため、総転送量や共通ランタイムの警告がすべてなくなるという計測ではない。
