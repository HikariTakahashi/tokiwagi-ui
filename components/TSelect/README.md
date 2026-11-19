# TSelectの利用ルール

## 概要

候補から1つの値を選ぶ、React・Vue・Astro共通の入力部品です。HTML標準のselectを使い、フォーム送信・必須検証・リセットと端末の操作方法を維持します。

## 使用場面

表示する見本、色の指定方法、分類など、選択肢が決まっている入力に使います。LPのカラー見本では「ボタン／ラベル／カード」と「CSS変数／HEX値」を切り替えます。候補は文字列のvalue・labelと任意のdisabledを持つoptionsで渡します。表示名と保存値を分けられます。

## 状態の表し方

既定はtone=neutral、size=mdです。toneはneutralと7色のプライマリーを対等に選べます。通常は白い入力面とニュートラルの文字、ホバー・押下・フォーカスには同系色の淡い背景と濃い前景を使います。既存トークンの値を変更しません。disabledは標準属性で指定し、文字・背景・操作可否で表します。errorに文言を渡すと「エラー：」と説明を表示し、入力にaria-invalidを設定します。検証・保存処理は利用側が担当します。

placeholderを指定すると空文字の未選択候補を先頭に追加します。未選択へ戻すこともでき、required時は標準の必須検証で送信を防ぎます。placeholder使用時は空文字を他の候補に使いません。候補のvalueは重複できません。

## 使用しない場面

編集・削除などの操作メニュー、検索入力付きの候補、複数選択には使いません。children／slotや独自のoption描画、開閉状態を制御するAPIは提供しません。

## 表示とアクセシビリティ

現在値と既存TIconの下向き矢印を表示します。入力枠の角丸は32px、文字はsm/mdが0.875rem、lgが1rem、最小高さは32／36／40pxです。タッチ端末では44px以上とし、入力文字を16px以上にします。幅や配置用のclass・styleはselectへ転送します。

labelを指定すると入力に関連付けたlabelを表示します。省略時は外部labelとid、またはaria-label／aria-labelledbyで名前を与えてください。description・errorは一意なIDでaria-describedbyに接続し、利用側の既存参照も保持します。生成IDはReact・VueのSSRとhydrateで一致します。Astroは出力ごとにIDを生成し、クライアントの初期化は不要です。標準のname・form・required・disabled・autocomplete・ARIA・data属性とイベントはselectへ渡します。

開閉・矢印キー・文字検索・Enter・Escape・Tabはブラウザーの標準select操作に従います。対応するデスクトップブラウザーではCSSのbase-selectで標準pickerを整え、選択項目をチェックと背景で表します。未対応ブラウザーとタッチ端末はOS・ブラウザー標準の候補一覧です。別のlistboxや独自のキーボード処理は作りません。開いた一覧の細部は環境によって異なります。

Reactはvalue＋onChangeによる制御、またはdefaultValueによる非制御で使います。Vueはv-model、またはdefaultValueで使います。Astroのvalue／defaultValueは初期値です。非制御は標準のform.reset()で初期値へ戻ります。React・Vueで値を制御する場合は利用側のreset処理で状態も初期値へ戻します。

## 関連コンポーネントと使い分け

[TButton](../TButton/README.md)は操作の実行、TSelectは入力値の選択に使います。[TIcon](../TIcon/README.md)は装飾の矢印として再利用します。

[使用例を見る](../../src/stories/TSelect.stories.ts) / [カラーの使用ルール](../../src/stories/colors.mdx)
