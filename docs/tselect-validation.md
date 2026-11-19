# TSelect 検証記録（#161）

2026年11月19日。Bun 1.4.4、Playwright 1.64.1で確認。

## 実装とデザイン

React・Vue・AstroのTSelectを追加し、LP `/colors/` の見本・色指定方法の2欄へ適用した。ユーザー指定に合わせ、既定の高さ36px・入力枠の角丸32px・下向き矢印を使用する。候補一覧の角丸は8pxを維持する。LPの旧select向けCSSを除去し、2つの入力欄に32pxが適用されることを実際の計算済みスタイルでも確認した。対応するデスクトップではネイティブselectのCSS base-selectを使い、標準pickerを幅160px以上・項目高36px・選択チェック付きで表示する。独自listboxや開閉JavaScriptは使わない。未対応ブラウザー・タッチ環境は標準候補一覧を維持する。

## 自動検証

| コマンド | 結果 |
| --- | --- |
| `bun run check` | エラー0・警告0、既存のヒント7件 |
| `bun test` | 320件成功・失敗0 |
| `bun run check:react-compat` | React 18.0.0・18.3.1・19.0.0・19.3.1で公開型・SSR・hydrate・更新が成功 |
| `bun run build` | 成功 |
| `bun run build:storybook` | 成功 |

追加テストは、候補の重複・不正値、単一選択、未選択と必須、属性・イベント転送、ラベル・補足・エラーの参照、複数配置のID、React・VueのSSR/hydrate、Astro実出力、StorybookのAstro見本の変更通知と解放を対象とする。

## ブラウザー確認

PlaywrightのChromium・Firefox・WebKitで、3方式の実SSR出力について初期値・候補の無効化・必須検証・FormData・disabledの送信除外・form.reset()・ラベルによるフォーカスを確認した。ChromiumとWebKitはbase-selectの標準pickerでポインター選択、Firefoxは標準selectのキー操作を確認した。

LP `/colors/` では3ブラウザーで「ボタン→ラベル」「CSS変数→HEX値」を選び、コードとiframeの表示例の切替を確認した。390px・1440pxで表示し、カードの横はみ出しと選択欄の画面外へのはみ出しがないことを確認した。Chromiumのタッチエミュレーションでは標準pickerへのフォールバックと44px以上の高さを確認した。

静的StorybookではReact→Vue→Astroの切替時に値・色・サイズを保持し、実選択からControlsへ変更を通知し、URL再読み込みで選択値を復元できることを確認した。390pxでも入力欄が収まる。Astroの実HTMLへはネイティブchangeを直接接続し、表示差し替えと離脱で解除する。

## 未検証と利用側の責任

実機のSafari・iOS・Android、VoiceOver等の支援技術による読み上げは未検証。Playwright WebKitとタッチエミュレーションは実機検証を代替しない。制御値を使うReact・Vueのフォームリセットでは、利用側が状態を初期値に戻す。外部公開と既存Nuxtアプリへの適用は含まない。
