# テスト方法

```sh
bun test
bun run check
bun run check:react-compat
bun run build
bun run build:storybook
```

Astro の出力は `dist/`、Storybook の出力は `storybook-static/` です。Vue・React・Astro向けの `TIcon` があります。Storybookの「コンポーネント/TIcon・TBrand・TLogo」はbell-offの使用例と同じストーリー形式です。Canvasには見本1つだけを中央表示し、設定は標準Controlsとargsで変更・URL保存します。TIconではReact・Vue・Astroを切り替えても公開名・サイズ・色を保持します。詳細説明のAstro側への移設は別作業です。npm配布・外部ホスティングと既存Nuxt画面の置き換えは未実施です。GitHubリポジトリ自体はPublicです。

`check:react-compat` は一時ディレクトリにReact 18.3.1と開発環境のReact 19系をそれぞれ導入し、対応する型定義で公開型・全329原本×4サイズ・SSR・ハイドレーションを検証します。依存取得にはネットワーク接続が必要です。通常の `node_modules` とロックファイルは変更せず、一時ディレクトリは終了時に削除します。


## テスト環境と対象

テストランナーはBun Test（`bun:test`）です。DOMとハイドレーションの検証にはHappy DOM、React・VueのSSRには各フレームワークのサーバー描画機能、AstroにはコンパイラとContainer APIを使用します。新しいテスト基盤は導入しません。

- `src/lib/*.test.ts`：トークンの読み込み、色の組み合わせ、アイコン原本・公開名・変換。
- `src/react/`・`src/vue/`・`src/astro/` のテスト：公開Props、サイズ・不正入力、全原本の描画、ID分離、SSR・ハイドレーション（対応方式）。
- `src/stories/`・`src/stories/components/` のテスト：原本資料の参照、見本の切り替え・非同期読込、URL保存など。
- `bun run check`：Astro Checkによる型・テンプレートの診断。型検査用ファイルも確認します。
- `bun run build`・`bun run build:storybook`：紹介ページと静的資料のビルド確認。

56組の既定の前景・背景ペアについてコントラスト比4.5:1以上を検証します。任意の色の組み合わせやすべてのUIへの保証ではありません。ブランド部品のテストも既存実装の回帰確認として残しますが、MITによる利用許諾とは別です。

## テスト追加時の基本ルール

- `describe` と `test` の名前は日本語にします。
- 各テスト直前に、目的・条件・期待結果を日本語コメントで記載します。
- 公開API・不正値・複数インスタンスなど、意味のある境界を検証します。
- テストを変更したら `bun test` を実行します。
- UI変更時は型検査・両ビルドに加え、モバイル／デスクトップ、キーボードフォーカス、ホバー・押下をブラウザで確認します。
- 実行していない項目・ネットワーク制約・失敗した項目をPRの検証欄に明記します。ブラウザでの確認をBun Testだけで代替したと報告しません。
