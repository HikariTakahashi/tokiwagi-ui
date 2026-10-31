# フォントの使用ルール

Tokiwagi UIの標準フォントは **San Francisco** です。WebではApple端末のシステムフォントとして利用し、`-apple-system`・`BlinkMacSystemFont`・`system-ui`で指定します。フォントファイルの同梱やWebフォントのダウンロードは行いません。

## 適用範囲

- 本文・見出し・ラベル・ボタン・入力欄・ブランド名称は、同じサンセリフの共通トークンを使います。
- Storybookのサイドバー・Controls・Docs・Canvas、Astroの紹介ページ、React・Vue・AstroのTBrandに適用します。
- コード・キーボード入力・技術的な識別子は読み取りやすい等幅フォントを使います。Apple端末ではSF Monoを優先するシステム指定とします。
- 既存の文字サイズ・太さ・行高・字間は維持します。フォント名をサイズや用途ごとに切り替えません。

## 日本語と代替フォント

San Franciscoで表示できない日本語などの文字は、OSの対応フォントへフォールバックします。日本語の表示がSan Franciscoだけで完結することは前提にしません。

Windows・Android・Linuxなどでは`system-ui`を通じて各OSの標準UIフォントを使います。後続の日本語書体と汎用ファミリーは、システム指定で表示できない場合の代替です。すべてのOSでSan Franciscoと同じ字形・文字幅になることは保証しません。日本語と英数字が混ざる文字列でも、コンポーネントごとに別のフォントを指定しないでください。

## 共通トークン

定義元は`tokens/typography.css`です。ファミリーの列挙をコンポーネントや見本へ複製しません。

| トークン | 用途 |
| --- | --- |
| `--tkw-font-family-sans` | San Franciscoを基準とする通常のUIテキスト |
| `--tkw-font-family-mono` | コード・キーボード入力・技術的な識別子 |

利用側のルートで一度読み込みます。トークンCSS自体は変数だけを公開し、要素のスタイルを変更しません。

```css
@import "tokiwagi-ui/tokens/typography.css";

:root { font-family: var(--tkw-font-family-sans); }
button, input, select, textarea { font-family: inherit; }
code, pre, kbd, samp { font-family: var(--tkw-font-family-mono); }
```

Tailwind CSS v4では`tokiwagi-ui/tokens/tailwind.css`にも含まれます。`font-sans`・`font-mono`はそれぞれの共通トークンを参照します。Preflightの追加は不要です。

TBrandの名称も`--tkw-font-family-sans`を参照します。利用側では色の`neutrals.css`とともに`typography.css`、または両方を含む`tailwind.css`を読み込んでください。名称の16px・太さ600・行高1.5・通常の字間は維持します。

## 確認する文字列

- 英字：`The quick brown fox jumps over the lazy dog.`
- 日本語混在：`今日の予定を確認する — TokiWa Calendar`
- 日時・数字：`2026/10/31 09:00–18:30 · 0123456789`
- 太さ：400（通常）・500（中）・600（強調）・700（太字）

実機で日本語と英数字の混在、入力欄への継承、改行・省略・ボタンの横幅を確認します。太字だけで状態を表さず、必要な文言やアイコンも併記します。

## 参考

- [Apple Fonts](https://developer.apple.com/fonts/)
- [WebKit: Using the System Font in Web Content](https://webkit.org/blog/3709/using-the-system-font-in-web-content/)
