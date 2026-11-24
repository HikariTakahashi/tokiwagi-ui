# コンポーネントの使い方

本ページの利用例はMIT対象のTCheckbox・TCardと構造パーツ・TButton・TText・TIcon・THeader・THeaderSection・THeaderButton・THeaderLink・THeaderButtonGroupです。[ライセンス適用範囲](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/LICENSE-SCOPE.md)を確認してください。`TLogo`・`TBrand` は同じ入口からexportされていますがMIT対象外です。既存の詳細・利用例は[ブランド参照資料](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/docs/brand-reference.md)に保存しています。

## 導入方法と対象環境

### 共通フォント

標準フォントはSan Franciscoです。`tokiwagi-ui/tokens/typography.css`を読み込み、ルートに`font-family: var(--tkw-font-family-sans)`、入力欄・ボタンに`font-family: inherit`を指定します。コードには`var(--tkw-font-family-mono)`を使います。Tailwind CSS v4の共有テーマにも含まれ、`font-sans`・`font-mono`で利用できます。日本語・Apple以外のOSはシステム書体へフォールバックし、フォント本体の同梱・配信は行いません。詳細は[フォントの使用ルール](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/docs/typography.md)とStorybookの「フォント/使用ルール」を参照してください。

### ローカル導入

npmレジストリへの公開・配布ビルドは未実施です。下記はGitから取得した `tokiwagi-ui` を、隣接するアプリへローカル導入する方法です。`private: true` を維持しています。

```text
workspace/
├── tokiwagi-ui/
└── your-app/      # 下記コマンドはこのアプリ側で実行
```

```sh
bun add ../tokiwagi-ui
# npmを使う利用側では npm install ../tokiwagi-ui
```

`icons/`・`src/`・`tokens/` を含むソース一式が必要です。生成済みJavaScriptのみを配るパッケージではなく、Viteの `?raw` 読み込み、TypeScript、および利用するフレームワークに対応したビルド環境が必要です。ローカル導入で含まれるブランド関連ファイルの権利はMITへ変わりません。

## カラートークンとTailwind

必要なトークンのCSSをアプリ全体で一度読み込みます。`colors.css`（42）、`secondary.css`（18）、`semantic.css`（24）、`neutrals.css`（9）の計93トークンが定義元です。HEXを利用側や文書へ複製せず、CSSカスタムプロパティを参照してください。

プライマリーとライム・オレンジの `-on` は白です。イエローの通常・ホバー・押下は、ユーザー指定の白文字を使う基準不足の例外です。通常・ホバーは大きな文字の3:1、押下は通常サイズの文字の4.5:1を満たしません。他のプライマリーとライム・オレンジの基準色・`-hover` 上では24px以上の文字など、大きな文字やアイコンに使います。通常サイズの文字には、`-subtle` と濃い `-on-subtle` の組み合わせなど、4.5:1以上の配色を使います。

Tailwind CSS v4の利用側では、既存のTailwindエントリに `@import "tokiwagi-ui/tokens/tailwind.css";` を追加して共有テーマを読み込めます。`@theme inline` は既存トークンを参照します。このテーマ自体はPreflightを読み込みません。

## TCheckbox

カレンダーなどの項目の選択に使うチェックボックスです。`tokiwagi-ui/checkbox.css` を一度読み込み、`tokiwagi-ui/react`、`tokiwagi-ui/vue` または `tokiwagi-ui/astro` から `TCheckbox` をimportします。各入口で `TCheckboxProps`、`CheckboxOptions`、`CheckboxTone`、`checkboxTones` を利用できます。[利用ルール](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TCheckbox/README.md)とStorybook「コンポーネント/TCheckbox」も参照してください。

| 指定 | 内容 |
| --- | --- |
| `label` | 項目名。省略するときは `aria-label` または `aria-labelledby` で入力に名前を付けます。 |
| `description` / `error` | 任意の補足・エラーメッセージです。入力の `aria-describedby` に追加し、`error` の指定時は `aria-invalid` を設定します。 |
| `tone` | `green`、`teal`、`blue`（既定）、`violet`、`rose`、`coral`、`amber`。 |
| `indeterminate` | 一部選択の表示を指定するboolean。既定は `false`。送信値はチェックの有無で決まります。 |
| `defaultChecked` | 初期選択を指定するboolean。未指定時は未選択です。 |
| `checked` / `modelValue` | Reactの `checked`、Vueの `v-model` は選択状態を制御します。Astroの `checked` は初期値です。どの方式でも指定時は `defaultChecked` より優先します。 |
| 標準属性 | `id`、`name`、`value`（文字列）、`form`、`disabled`、`required`、`className` / `class`、`style`、ARIA属性などを入力へ渡します。入力の種類と選択状態にはネイティブのチェックボックスのセマンティクスを使います。 |

未定義の色や、公開設定に合わない状態値・文字列は日本語エラーで通知します。Reactは `onChange` の `event.currentTarget.checked`、Vueは `update:modelValue` のbooleanと標準 `change`、Astroは入力の `change` イベントで変更を受け取れます。チェックされた有効な入力は `name` と `value` をフォーム送信します。`value` を省略するとブラウザー標準の `on` になります。非制御の入力はフォームリセットで初期値に戻ります。制御値をリセットする場合はフォームの `reset` ハンドラーで利用側の状態を戻します。

### Reactで一括選択する

```tsx
import { useState } from 'react';
import { TCheckbox } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/checkbox.css';

const calendars = [
  { id: 'personal', label: '個人' },
  { id: 'work', label: '仕事' },
];

export function CalendarVisibility() {
  const [selected, setSelected] = useState<string[]>(['personal']);
  const all = calendars.every(({ id }) => selected.includes(id));
  return (
    <form onReset={() => setSelected(['personal'])}>
      <fieldset>
        <legend>表示するカレンダー</legend>
        <TCheckbox label="すべて" checked={all} indeterminate={!all && selected.length > 0}
          onChange={event => setSelected(event.currentTarget.checked ? calendars.map(({ id }) => id) : [])} />
        {calendars.map(({ id, label }) => (
          <div key={id}>
            <TCheckbox label={label} name="calendars" value={id} checked={selected.includes(id)}
              onChange={event => {
                const checked = event.currentTarget.checked;
                setSelected(current => checked ? [...current, id] : current.filter(value => value !== id));
              }} />
          </div>
        ))}
      </fieldset>
      <button type="reset">初期状態に戻す</button>
    </form>
  );
}
```

非制御の入力は `<TCheckbox label="仕事" name="work" defaultChecked />` のように初期値を指定します。ReactとVueでは `indeterminate` の解除・更新も利用側で行います。

### Vueで使う

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { TCheckbox } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/checkbox.css';

const visible = ref(true);
</script>

<template>
  <form @reset="visible = true">
    <TCheckbox v-model="visible" name="calendar" value="work" label="仕事" />
    <button type="reset">初期状態に戻す</button>
  </form>
</template>
```

### Astroで使う

```astro
---
import { TCheckbox } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/checkbox.css';
---

<form>
  <TCheckbox id="calendar-filter" name="calendar" value="work" label="表示するカレンダー" indeterminate />
  <button type="reset">初期状態に戻す</button>
</form>

<script>
  const checkbox = document.querySelector<HTMLInputElement>('#calendar-filter');
  checkbox?.addEventListener('change', () => {
    const checked = checkbox.checked;
    // checked を使って画面の表示を更新する。
  });
</script>
```

Astroアプリにnpmでローカル導入する場合は、`npm install --install-links ../tokiwagi-ui` でパッケージを配置します。

Astroは入力を静的HTMLとして出力し、同梱スクリプトが一部選択をネイティブの `HTMLInputElement.indeterminate` に設定します。以降は利用側のスクリプトからこのプロパティを更新できます。フォームリセットは初期チェックと初期の一部選択を復元します。クライアント側のフレームワークは不要です。

React・Vueはサーバーとクライアントで同じ初期状態を指定します。一部選択はSSRで視覚表示し、ハイドレーション時に入力のDOMプロパティへ設定します。自動IDは各方式の入力・ラベル・補足・エラーの関連付けに使います。複数のSSRルートでは、Reactの `identifierPrefix`、Vueの `app.config.idPrefix` をルートごとに分け、同じルートのサーバーとクライアントで揃えてください。


## TSelect

候補から1つの値を選ぶ部品です。`tokiwagi-ui/select.css`を一度読み込み、各方式の入口から`TSelect`をimportします。CSSはニュートラル・プライマリー・セマンティック・書体の既存トークンを読み込みます。[利用ルール](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TSelect/README.md)とStorybook「コンポーネント/TSelect」も参照してください。

```ts
import 'tokiwagi-ui/select.css';
const options = [
  { value: 'button', label: 'ボタン' },
  { value: 'label', label: 'ラベル' },
  { value: 'card', label: 'カード', disabled: true },
];
```

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `options` | `readonly SelectOption[]`、必須 | `value: string`・`label: string`・任意の`disabled: boolean` |
| `placeholder` | `string`、未指定 | 空文字の未選択候補を先頭に追加。候補の空文字との併用不可 |
| `label` | `string`、未指定 | 入力に関連付けた見出し。省略時は外部labelまたはARIAで名前を指定 |
| `description`・`error` | `string`、未指定 | 補足・エラーを表示して`aria-describedby`へ追加。errorがある場合は`aria-invalid=true` |
| `tone` | `SelectTone`、`neutral` | neutralと7色（green/teal/blue/violet/rose/coral/amber）。淡い背景・濃い前景・フォーカスを共通化 |
| `size` | `SelectSize`、`md` | sm/md/lg、最小高さ32/36/40px。タッチ環境は44px以上、入力文字16px以上 |
| React `value`・`defaultValue` | `string`、未指定 | value＋onChangeによる制御、またはdefaultValueによる初期値。併用しない |
| Vue `modelValue`・`defaultValue` | `string`、未指定 | v-model、または非制御の初期値 |
| Astro `value`・`defaultValue` | `string`、未指定 | 初期値。valueを優先。変更はネイティブchangeイベントで取得 |

`TSelectProps`・`SelectOptions`・`SelectOption`・`SelectTone`・`SelectSize`・`selectTones`・`selectSizes`を3方式から公開します。値とラベルはHTMLとして解釈しません。valueの重複、placeholderと空文字候補の重複、不正な型・色・サイズは日本語エラーにします。選択値は候補のvalueを指定してください。未指定時はネイティブselectと同じく先頭の有効な候補を表示します。

React:

```tsx
import { useState } from 'react';
import { TSelect } from 'tokiwagi-ui/react';
function Example() {
  const [value, setValue] = useState('button');
  return <form onReset={() => setValue('button')}>
    <TSelect options={options} label="見本" name="example" value={value}
      onChange={event => setValue(event.currentTarget.value)} />
    <button type="reset">初期値に戻す</button>
  </form>;
}
// 非制御の場合は <TSelect options={options} defaultValue="button" label="見本" />
```

Vue:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { TSelect } from 'tokiwagi-ui/vue';
const value = ref('button');
const options = [{ value: 'button', label: 'ボタン' }, { value: 'label', label: 'ラベル' }];
</script>
<template>
  <form @reset="value = 'button'">
    <TSelect v-model="value" :options="options" label="見本" name="example" />
    <button type="reset">初期値に戻す</button>
  </form>
</template>
```

Astro:

```astro
---
import { TSelect } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/select.css';
const options = [{ value: 'tokens', label: 'CSS変数' }, { value: 'hex', label: 'HEX値' }];
---
<form id="color-format">
  <TSelect id="format" options={options} value="tokens" name="format" label="色の指定方法"
    description="コードの出力形式を選びます" required />
  <button type="reset">初期値に戻す</button>
</form>
<script>
  document.querySelector<HTMLSelectElement>('#format')?.addEventListener('change', event => {
    const value = (event.currentTarget as HTMLSelectElement).value;
    // コードの切り替え等は利用側で接続する。
    console.log(value);
  });
</script>
```

`id`・`name`・`form`・`required`・`disabled`・`autocomplete`・ARIA・data属性とネイティブイベントはselectへ転送します。ReactのclassName、Vue・Astroのclassおよびstyleもselectに付きます。children／slot・multiple・ネイティブの複数行sizeは公開しません。別のlabelから参照する場合はidを明示します。description・errorのIDは生成し、利用側のaria-describedbyも保持します。

React・VueはuseIdによってSSRとhydrateの参照を一致させます。複数rootでは既存部品と同様にidentifierPrefix／app.config.idPrefixを分けます。Astroは出力時のUUIDを使い、クライアント初期化や独自の開閉JavaScriptは不要です。必須検証・フォーム送信・非制御のform.reset()はネイティブ動作です。制御値を使うReact・Vueではreset時に利用側の状態も戻してください。

通常は白背景・ニュートラルの文字と枠、入力枠の角丸32pxで、矢印は既存の16px TIconです。デスクトップの対応ブラウザーでは`appearance: base-select`で標準pickerを幅160px以上・角丸8pxの一覧に整え、選択中の候補をチェックで示します。これはネイティブselectのCSS拡張で、独自listboxではありません。未対応ブラウザーとタッチ端末ではOS・ブラウザー標準の一覧を使用します。表示差のある機能なので、一覧の外観を全環境で固定するAPIは提供しません。[MDNのcustomizable select解説](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select)を参照してください。

## Astroでの利用

TIconの図柄・サイズ・色の選び方と、親要素が担う意味・操作のルールは、[TIconの利用ルール](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TIcon/README.md)を参照してください。React・Vueでも同じルールに従います。

Astroの入口は `src/astro/index.ts`、パッケージの公開入口は `tokiwagi-ui/astro` です。このリポジトリのAstro 7.4.13で検証しています。npm公開・配布ビルドは未実施で、`bun add ../tokiwagi-ui`（npmの場合 `npm install ../tokiwagi-ui`）でローカルパッケージとして取り込みます。`icons/`・`src/`・`tokens/`を含むリポジトリ全体を参照してください。Astro/Viteの `.astro` と `?raw` 読み込みを使用し、React・Vueの導入は不要です。

```astro
---
import { TIcon, isIconName, type IconName } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';
const fromApi: string = 'calendar';
const safeName: IconName = isIconName(fromApi) ? fromApi : 'help';
---
<button type="button" aria-label="通知一覧を開く" class="notification-button">
  <TIcon name="bell" size={24} class="notification-icon" />
</button>
<a href="/tasks"><TIcon name="task" size={20} /> タスク一覧</a>
<span><TIcon name={safeName} color="var(--tkw-color-primary-blue-on-subtle)" /> カレンダー</span>
<span><TIcon name="check" size={20} /> 完了</span>
```

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `name` | `IconName`（必須） | 全336個の公開名から選ぶ |
| `size` | `IconSize = 16 \| 20 \| 24 \| 32`、既定24 | 正方形の表示サイズ |
| `color` | `string`、既定 `currentColor` | 親の文字色を継承。明示指定は既存トークンを参照 |
| `class` | `string` | SVGのクラス名 |

`TIconProps`、`IconName`、`IconSize`、`iconNames`、`isIconName` を同じ入口からexportします。名前の誤記と非対応サイズは型検査で検出し、型を迂回した場合も日本語エラーを投げます。外部文字列は `isIconName()` で検証し、代替名は利用側で選びます。

React・Vue版と同じ装飾用APIです。SVGの `aria-hidden="true"`・`focusable="false"`・32×32のviewBox・width/heightを固定し、追加のSVG属性（id、role、aria-label、styleなど）・イベント・slotは転送しません。意味のある状態・情報は読み上げ可能なテキストを併記します。アイコンだけのリンクやボタンには親に目的が分かる名前を付けます。フォーカス、ホバー、押下、無効状態、操作領域は親が担い、クラスで形状・線幅・サイズを上書きしません。

黒い線と塗りだけをcurrentColor化し、原本の座標・線幅・縦横比・透明な塗り・白いクリッピングを維持します。クリッピングIDはビルド／サーバー描画時に `crypto.randomUUID()` でインスタンスごとに生成し、出力HTMLに保存します。ハイドレーションやクライアントランタイムは不要で、ビルドごとにID文字列は変わります。アプリ向け入口はREADME全文、Storybook専用コード、React・Vueランタイムを読み込みません。

Storybookの「コンポーネント/TIcon」でAstroを選ぶと、実コンポーネントが生成した静的HTMLを表示します。React・Vueとの切り替え時も公開名・サイズ・色は維持します。

StorybookのAstro見本は `.storybook/astro-previews.ts` がBunの別プロセスで公開入口の実コンポーネントを全336種×4サイズ描画し、仮想モジュールとして供給します。生成JSONは一時ファイルへの書き込み完了後に読み込み、成功・失敗にかかわらず一時ファイルを削除します。Astro選択時にHTMLデータを読み込み、複数表示ではIDだけをインスタンスごとに分離します。色は親から継承します。Astroランタイムや別のAstroサーバーは不要で、静的Storybookにも描画結果を収録します。開発中に原本・実コンポーネントを編集すると再生成し、色CSSの変更は既存のHMRで反映します。生成結果はコミットしません。

`bun test` はAstroコンパイラと [公式Container API](https://docs.astro.build/en/reference/container-reference/) で実コンポーネントを描画し、全原本×4サイズ、並行描画のID、入力エラー、固定属性、公開入口への資料・他ランタイムの混入を検証します。


## Reactでの利用

React `^18.0.0 || ^19.0.0` とViteの `?raw` 読み込みに対応する環境を対象にします。各系列の下限はReact・React DOM 18.0.0と19.0.0です。対応する型定義と、公開型・SSR・DOMハイドレーション・props更新の検証結果は[テスト方法](Testing#react互換性の検証結果)を参照してください。入口は `src/react/index.ts`、パッケージの公開入口は `tokiwagi-ui/react` です。npm公開・配布ビルドは未実施で、ローカルパッケージとして利用します。Reactは利用側のpeer dependencyです。React・Vueのpeerはoptionalで、選んだ入口のフレームワークを利用側に導入してください。

同じワークスペースのReactプロジェクトなら `bun add ../tokiwagi-ui`（npmの場合 `npm install ../tokiwagi-ui`）で取り込めます。`icons/`・`src/`・`tokens/`を含むリポジトリ全体を参照してください。Reactの重複ロードを避けるため、Viteに `resolve: { dedupe: ['react', 'react-dom'] }` を設定します。アプリのReactとReact DOMは対応する同じバージョンを使います。

```tsx
import { TIcon, isIconName, type IconName } from 'tokiwagi-ui/react';
// アプリ全体で一度読み込む。色値の定義元はtokens/だけ。
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';

const fromApi: string = 'calendar';
const safeName: IconName = isIconName(fromApi) ? fromApi : 'help';

export function Actions() {
  return <>
    <button type="button" aria-label="通知一覧を開く" className="notification-button">
      <TIcon name="bell" size={24} className="notification-icon" />
    </button>
    <button type="button"><TIcon name="plus" size={20} /> タスクを追加</button>
    <span>
      <TIcon name={safeName} color="var(--tkw-color-primary-blue-on-subtle)" /> カレンダー
    </span>
  </>;
}
```

```css
.notification-button {
  color: var(--tkw-color-primary-blue-on);
  background: var(--tkw-color-primary-blue);
  min-width: 44px;
  min-height: 44px;
}
.notification-button:hover { background: var(--tkw-color-primary-blue-hover); }
.notification-button:active { background: var(--tkw-color-primary-blue-active); }
.notification-button:focus-visible {
  outline: 3px solid var(--tkw-color-primary-blue-on-subtle);
  outline-offset: 3px;
}
```

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `name` | `IconName`（必須） | 全336個の公開名から選ぶ |
| `size` | `IconSize = 16 \| 20 \| 24 \| 32`、既定24 | 正方形の表示サイズ |
| `color` | `string`、既定 `currentColor` | 親の文字色を継承。明示指定は既存トークンを参照 |
| `className` | `string` | React形式のクラス名をSVGに適用 |

`TIconProps`、`IconName`、`IconSize`、`iconNames`、`isIconName` を同じ入口からexportします。公開名の誤記と非対応サイズは型検査で検出し、型を迂回した場合も日本語エラーを投げます。外部文字列は `isIconName()` で検証し、代替名は利用側で選びます。アプリ向け入口はREADME本文、Storybook専用コード、Vueランタイムを読み込みません。

`TIcon` はVue版と同じ装飾用APIです。SVGの `aria-hidden="true"`、`focusable="false"`、viewBox、サイズを固定し、追加属性・イベント・children・refは転送しません。アイコンだけの操作には親のbutton/linkに操作名を付け、状態・情報には読み上げ可能なテキストを併記します。フォーカス、ホバー、押下、無効状態、操作領域は親が担います。クラスでviewBox・線幅・縦横比・サイズを上書きしないでください。

黒い線と塗りだけを `currentColor` に変換し、原本の形状・透明な塗り・白いクリッピングを維持します。クリッピングIDはReactの `useId()` でインスタンスごとに分離します。SSRとクライアントでは同じコンポーネントツリーを描画してください。

同じ文書に複数React rootを置く場合は、それぞれ異なる `identifierPrefix` を指定し、SSR側とクライアント側で同じ値を使います。単一rootでは追加設定は不要です（[React公式のuseId仕様](https://react.dev/reference/react/useId)）。

```tsx
// サーバー側：htmlをsidebar-root要素の内側に出力する。
import { renderToString } from 'react-dom/server';
import { TIcon } from 'tokiwagi-ui/react';
const html = renderToString(<TIcon name="moon" />, { identifierPrefix: 'sidebar-' });
```

```tsx
// クライアント側：サーバーと同じツリー・接頭辞を使用する。
import { hydrateRoot } from 'react-dom/client';
import { TIcon } from 'tokiwagi-ui/react';
hydrateRoot(document.getElementById('sidebar-root')!, <TIcon name="moon" />, {
  identifierPrefix: 'sidebar-',
});
```

クライアント描画だけの場合は `createRoot(element, { identifierPrefix: 'sidebar-' })` を使います。別rootには別の接頭辞を指定します。

Storybookの「コンポーネント/TIcon」でReactを選ぶと、全公開名・4サイズ・トークン色の実コンポーネントを確認できます。方式の切り替えはStorybookで、公開API・導入・SSR・アクセシビリティの説明は本ページで確認します。


## Vueでの利用

Vue 3.5以上とViteの `?raw` 読み込みに対応した環境（Nuxt/Vueなど）を対象にします。入口は `src/vue/index.ts`、パッケージの公開入口は `tokiwagi-ui/vue` です。npmへの公開・配布ビルドは未実施で、ローカルパッケージとして利用します。Vueは利用側のpeer dependencyです。

同じワークスペースのNuxt/Vueプロジェクトなら `bun add ../tokiwagi-ui`（npmの場合 `npm install ../tokiwagi-ui`）で取り込めます。`icons/`・`src/`・`tokens/`を含むリポジトリ全体を参照してください。別のVueをロードしないよう、Viteの `resolve.dedupe: ['vue']` を指定します。Nuxtでは `vite: { resolve: { dedupe: ['vue'] } }` です。

```vue
<script setup lang="ts">
import { TIcon, isIconName, type IconName } from 'tokiwagi-ui/vue';
// アプリ全体で一度読み込む。色値の定義元はtokens/だけ。
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';

const notificationIcon: IconName = 'bell';
const fromApi: string = 'calendar';
const safeName: IconName = isIconName(fromApi) ? fromApi : 'help';
</script>

<template>
  <button type="button" aria-label="通知一覧を開く" class="notification-button">
    <TIcon :name="notificationIcon" :size="24" class="notification-icon" />
  </button>
  <button type="button">
    <TIcon name="plus" :size="20" /> タスクを追加
  </button>
  <span>
    <TIcon :name="safeName" color="var(--tkw-color-primary-blue-on-subtle)" /> カレンダー
  </span>
</template>

<style scoped>
.notification-button {
  color: var(--tkw-color-primary-blue-on);
  background: var(--tkw-color-primary-blue);
  min-width: 44px;
  min-height: 44px;
}
.notification-button:hover { background: var(--tkw-color-primary-blue-hover); }
.notification-button:active { background: var(--tkw-color-primary-blue-active); }
.notification-button:focus-visible {
  outline: 3px solid var(--tkw-color-primary-blue-on-subtle);
  outline-offset: 3px;
}
</style>
```

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `name` | `IconName`（必須） | 全336個の公開名から選ぶ |
| `size` | `IconSize = 16 \| 20 \| 24 \| 32`、既定24 | 正方形の表示サイズ。Vueテンプレートでは `:size="20"` のように数値で渡す |
| `color` | `string`、既定 `currentColor` | 親の文字色を継承。明示指定は `var(--tkw-color-…)` を使う |
| `class` | Vueの `HTMLAttributes['class']` | 文字列・配列・オブジェクトをSVGに適用 |

`TIconProps`、`IconName`、`IconSize`、`iconNames`、`isIconName` を同じ入口からexportします。公開名の誤記と非対応サイズは型検査で検出します。JavaScriptや外部データが型を迂回した場合も日本語エラーを投げ、別の図柄へ暗黙に置き換えません。外部文字列は `isIconName()` で検証し、必要な代替名は利用側で選びます。

`TIcon` は装飾用です。`aria-hidden="true"` と `focusable="false"` を固定し、SVG自体にクリックやフォーカスを設けません。公開props以外の属性・イベント・slotは転送しません。アイコンだけの操作には親のbutton/linkに操作内容の読み上げ名を付け、状態や情報には読み上げ可能な文言を併記します。クラスでviewBox・線幅・縦横比・サイズを上書きしないでください。小さい図柄が判別しにくければサイズを上げます。

クリッピングIDはVueの `useId()` でインスタンスごとに分離し、SSRとハイドレーションで安定させます。同じHTML文書に複数のVueアプリを置く場合は、それぞれ `app.config.idPrefix` を別の値に設定し、SSR側・クライアント側では同じ値を使ってください（[Vue公式のuseId仕様](https://vuejs.org/api/composition-api-helpers.html#useid)）。通常の単一Nuxtアプリでは追加設定は不要です。

Storybookの「コンポーネント/TIcon」でVueを選ぶと、Vueの実コンポーネントの表示を確認できます。選択した名前・サイズ・色はReactとの切り替え時も保持します。


## 管理元

- コンポーネントの利用ルールは [TBrand](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TBrand/README.md)・[TIcon](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TIcon/README.md)・[TLogo](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TLogo/README.md) の個別READMEが管理元です。Storybookの「コンポーネント/個別ルール」はこれらを読み込む表示用ページで、最小プレビューとは分けて参照できます。MIT対象の公開API・利用コード・導入説明は本ページ、ブランドの詳細は[ブランド参照資料](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/docs/brand-reference.md)に保持します。
- カラー値は `tokens/colors.css`、`tokens/secondary.css`、`tokens/semantic.css`、`tokens/neutrals.css` の全93トークンが定義元です。Storybook の見本・HEX・コントラスト表示はこれらを読み込みます。
- カラーの使用ルールと操作例は Storybook の「カラー」にあります。CSS を編集して保存すると開発中の表示に反映されます。
- ロゴの原本は `icons/logo/logo.svg`、使用ルールは `icons/logo/README.md` が管理元です。Storybookの「ロゴ/使用ルール」で32・64・128pxの見本、名称との併記、原本ダウンロードを確認できます。固定配色と最小32pxのルールを持つブランド資産として管理し、336種の汎用アイコン一覧とTIconの公開名生成には含めません。
- 画面遷移に添える右上矢印は `arrow-top-right`・`arrow-top-right-off`・`calendar-arrow-top-right`・`task-arrow-top-right`・`circle-arrow-top-right`・`square-arrow-top-right`・`triangle-arrow-top-right` です。例：`<TIcon name="arrow-top-right" />`。鎖の `link` 系とメールの `circle-mail` は従来どおり利用できます。
- アイコンの公開名は Storybook の「アイコン/命名基準」と「アイコン/アイコン名および用途」（一覧）で管理します。各アイコンの用途・使用ルール・検索用の別名は `icons/<公開名>/README.md` が管理元です。一覧から全336アイコンの「個別ルール」へ移動できます。README と個別ページは概要・使用場面・状態の表し方・使用しない場面・表示とアクセシビリティ・関連アイコンと使い分けの6セクションです。`bell` のルールは確定済み、ほかは詳細ルール案です。既存アプリの参照 ID は「アイコン/既存フロントエンドとの対応」に保持しています。SVG 図形は各 README と同じディレクトリに336個収録済みです。一覧で検索・分類・サイズ・色を切り替え、「アイコン/使用例」の全336ストーリーではReact版の公開TIconを1つ中央に表示します。公開名は固定し、初期値は24px・currentColorです。Controlsで16・20・24・32pxと、継承・ニュートラル・7色のプライマリーを切り替え、選択をURLに保持します。Actions・Interactionsは標準パネルとして表示します。各個別ルールから対応する使用例に移動できます。
- Tailwind CSS v4 の共有テーマは `tokens/tailwind.css` です。

## TLinkButton

画面遷移をTButtonと同じ大きさ・配色のボタンとして表示します。React・Vue・Astroの公開入口から`TLinkButton`と`TLinkButtonProps`をインポートし、`tokiwagi-ui/link-button.css`を一度読み込みます。このCSSはTButtonの共通CSSも読み込むため、ボタン用CSSの追加読み込みは不要です。

```tsx
// React
import { TLinkButton } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/link-button.css';

<TLinkButton href="/calendar" leadingIcon="calendar" trailingIcon="arrow-top-right">
  カレンダーを開く
</TLinkButton>
```

```vue
<script setup lang="ts">
import { TLinkButton } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/link-button.css';
</script>
<template>
  <TLinkButton href="/calendar" leading-icon="calendar" trailing-icon="arrow-top-right">カレンダーを開く</TLinkButton>
</template>
```

```astro
---
import { TLinkButton } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/link-button.css';
---
<TLinkButton href="/calendar" leadingIcon="calendar" trailingIcon="arrow-top-right">カレンダーを開く</TLinkButton>
```


`size`は文字・アイコン・最小高さ・左右余白を連動させます。文字はrem、表のpxは標準16pxのルート文字サイズでの値です。縦のpaddingは6px、長い文言では高さが伸びます。角丸・色はサイズに連動させません。

| size | 文字 | アイコン | 最小高さ | 左右padding | gap |
| --- | --- | --- | --- | --- | --- |
| sm | 1.25rem（20px） | 20px | 40px | 12px | 6px |
| md | 1.5rem（24px） | 24px | 44px | 14px | 8px |
| lg（既定） | 1.75rem（28px） | 32px | 50px | 16px | 10px |

```tsx
<TLinkButton href="/calendar" size="md" trailingIcon="arrow-top-right">カレンダーを開く</TLinkButton>
```

`LinkButtonSize`・`linkButtonSizes`・`LinkButtonOptions`は各方式の公開入口からインポートできます。TLinkButtonではinheritや未定義サイズを型・実行時の両方で拒否します。

`weight`はTButton・TTextと共通の `TextWeight` 型で、`normal`（400）・`medium`（500）・`semibold`（600）・`bold`（700）を指定します。省略時は `font-weight: inherit` で親から継承し、文字列の `inherit` や数値は受け付けません。サイズ・現在地・無効状態とは独立した設定です。`TextWeight`・`textWeights` は各方式の公開入口から利用できます。

```tsx
<TLinkButton href="/calendar">親の太さを継承</TLinkButton>
<TLinkButton href="/calendar" weight="medium">カレンダーを開く</TLinkButton>
```

従来の700固定から変わるため、既存の未指定箇所も親の太さに応じて表示が変わります。以前の太字を維持するには `weight="bold"` を指定してください。

標準属性はTLinkと同じです。sizeはTLinkButton専用のLinkButtonSize（sm/md/lg、既定lg）を指定します。href必須、toneの既定はneutral、leadingIcon・trailingIconは既定なし、target・rel・aria-current・downloadなどa要素の属性を受け付けます。文字ラベルはchildren／既定スロットで渡します。React・VueのネイティブイベントとclassName／classを転送します。空のhref・不正な色・未登録のアイコンには日本語エラーを返します。disabledはboolean（既定false）で、TButtonと同じ規則で不正値を拒否します。

サイズ未指定では現在の角丸12px、高さ50px以上、文字1.75rem、前後アイコン32pxを維持します。通常時は下線なしで、aria-currentに有効な現在地を指定するとラベルに下線を表示します。Tab・Enter・修飾キー・中央クリック・右クリックによるリンク操作を維持します。Spaceを独自にクリックへ変換しません。target=_blankではopenerを除きnoopenerを補完します。URLの検証・ルーター連携・現在地判定は利用側が担います。

toneの型と一覧はTButtonと同じ `ButtonTone`・`buttonTones` です。`neutral` と7色に加え、`neutral-0`・`neutral-600`・`neutral-800`・`neutral-900` を指定できます。色とホバー・押下・フォーカスはTButtonと同じトークンとCSSで、ニュートラルの状態別配色は本ページのTButtonの表を参照してください。本文用TLinkの `LinkTone`・`linkTones` はneutralと7色のままです。イエローと白文字などの既知のコントラスト制約もTButtonと同じです。カラーの使用ルールに従って使用先を確認してください。TButtonの角丸32px、TLinkの既定の文字サイズ継承と16pxアイコンはそれぞれ維持します。

React・VueのSSRとハイドレーション、複数rootのID接頭辞はTLink／TIconと同じ規則です。Astroはハイドレーション不要の静的リンクを出力します。Storybook「コンポーネント/TLinkButton」には実部品を1つ表示し、framework・text・href・tone・size・weight・leadingIcon・trailingIcon・disabled・target・rel・aria-currentを標準Controlsで変更します。設定を方式切り替え中も保持し、日本語や記号を含むtext・hrefもURLから復元します。

`disabled={true}`（Vueは`:disabled="true"`、Astroは`disabled`）で無効化します。TButtonと同じ無効色・影なし・操作不可カーソルを使い、ホバーと押下の配色を抑止します。無効時はhref・target・rel・download・pingなどのリンク属性とtabindex・autofocus・accesskey・contenteditable、渡されたクリック・キー・ポインター操作のハンドラーを除きます。role="link"とaria-disabled="true"を付け、Tab移動から外します。hrefはpropsとして引き続き必須で、有効に戻すと属性・イベントを復元します。React・Vueはクリック・中央クリック・ダブルクリック・起動キーの伝播も抑止し、Astroはクライアントscriptなしで遷移しない静的HTMLを出力します。利用側で後付けするイベントやルーターの委譲処理はaria-disabledを確認してください。aria-disabledだけの指定では動作を無効にしません。

```tsx
<TLinkButton href="/calendar" disabled={true}>カレンダーを開く</TLinkButton>
```

VueのautofocusはTLinkButtonPropsとコンポーネントの推論型で受け付けます。ReactではautoFocus、Astroではautofocusを指定します。disabled時はいずれも出力しません。

```vue
<TLinkButton href="/calendar" autofocus :disabled="false">カレンダーを開く</TLinkButton>
```

## TLink

React・Vue・Astroで本文や補助導線の画面遷移に使います。各方式の公開入口から`TLink`・`TLinkProps`と`linkTones`・`LinkTone`・`LinkOptions`・`LinkCurrent`・`linkSizes`・`LinkSize`をインポートできます。`tokiwagi-ui/link.css`を一度読み込みます。

```tsx
// React
import { TLink } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/link.css';

<TLink href="/calendar" tone="blue" trailingIcon="arrow-top-right">カレンダーを開く</TLink>
```

```vue
<script setup lang="ts">
import { TLink } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/link.css';
</script>

<template>
  <TLink href="/calendar" tone="blue" trailing-icon="arrow-top-right">カレンダーを開く</TLink>
</template>
```

```astro
---
import { TLink } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/link.css';
---
<TLink href="/calendar" tone="blue" trailingIcon="arrow-top-right">カレンダーを開く</TLink>
```

| 指定 | 型・既定値 | 用途 |
| --- | --- | --- |
| `href` | `string`（必須） | 相対URL・絶対URL・フラグメントなど。未指定・空文字・空白のみは日本語エラー |
| `tone` | `LinkTone`、既定`neutral` | neutral / green / teal / blue / violet / rose / coral / amber |
| `size` | `LinkSize`、既定`inherit` | inherit / sm / md / lg。文字とアイコンを連動 |
| `leadingIcon` / `trailingIcon` | `IconName`、既定なし | 前後の装飾アイコン。SVGは公開TIconを再利用 |
| `aria-current` | `LinkCurrent`、既定未指定 | 現在地を太字と太い下線で表示。false・文字列falseは強調しない |
| `target` / `rel` / `download` など | ネイティブのa要素の属性 | `_blank`ではopenerを除きnoopenerを補完。その他のrelを保持 |
| `className`（React）/ `class`（Vue・Astro） | 各方式のネイティブ型 | クラスを追加 |


| TLinkのsize | 文字 | アイコン |
| --- | --- | --- |
| inherit（既定） | 親から継承 | 16px |
| sm | 0.875rem（標準14px） | 16px |
| md | 1rem（標準16px） | 16px |
| lg | 1.125rem（標準18px） | 20px |

```tsx
<TLink href="/calendar" size="sm">予定の詳細を見る</TLink>
```

サイズ未指定では親の書式と16pxアイコンを維持します。文字サイズはremで、アイコン間隔は文字サイズに応じたemです。未定義のsizeは型・実行時の両方で拒否します。

内容はReactのchildren、Vue・Astroの既定スロットです。size=inheritでは文字の書式を周囲から継承します。通常時も下線を表示します。色にはneutral-900またはプライマリーのon-subtleトークンを使います。リンクの背景は透明なので、利用先の背景とのコントラストは利用側で確認してください。ホバー・押下は下線の太さ、キーボードフォーカスは輪郭で示します。長い文言は行内で折り返します。

ネイティブの属性とReact・Vueのイベントをa要素へ転送します。Tab・Enter、修飾キー・中央クリック・右クリックによるリンク操作を維持し、Spaceを独自にクリックへ変換しません。URLの決定・入力値の検証・ルーターとの連携・現在地の自動判定は利用側の責任です。disabledは提供しません。保存や切り替えの操作にはTButton、ヘッダーの移動にはTHeaderLinkを使います。

React・Vueはサーバーとクライアントで同じpropsと内容を渡してハイドレーションします。複数rootのID接頭辞などTIconのSSRルールも適用されます。Astroは静的なa要素を出力し、ハイドレーションを必要としません。実行時の処理は利用側scriptで接続します。Storybookの「コンポーネント/TLink」は3方式の実部品を1つ表示し、Controlsの設定をURLへ保存・復元します。

## TButton

React・Vue・Astroの公開入口 `tokiwagi-ui/react`・`tokiwagi-ui/vue`・`tokiwagi-ui/astro` から `TButton`、`TButtonProps`、`ButtonOptions`、`ButtonTone`、`buttonTones`、`ButtonSize`、`buttonSizes` を利用できます。`tokiwagi-ui/button.css` をアプリで一度読み込むと、状態のスタイルと必要な色・書体トークンが適用されます。既定のsizeはlgで、文字は1.75rem、高さは50px以上です。太さは未指定時に親から継承します。

ニュートラルの配色は次の組み合わせです。表の数値はすべて既存の `neutral-*` トークンを表し、文字色は装飾アイコンにも適用します。

| tone | 通常背景 | ホバー背景 | 押下背景 | 文字色 |
| --- | --- | --- | --- | --- |
| `neutral`（既定） | 100 | 200 | 400 | 900 |
| `neutral-0` | 0 | 100 | 200 | 900 |
| `neutral-600` | 600 | 800 | 900 | 0 |
| `neutral-800` | 800 | 900 | 1000 | 0 |
| `neutral-900` | 900 | 800 | 1000 | 0 |

`neutral-900` はホバー時に少し明るく、押下時に黒くなります。`neutral-1000` は通常のtoneとして公開せず、800・900の押下時の最大強調に限定します。追加4色の通常・ホバー・押下は、既定トークンで文字とのコントラストが4.5:1以上です。`neutral-0` でも境界線を保持します。無効時はtoneにかかわらず共通の無効色になります。

Reactではchildrenと標準のイベントpropsを使います。

```tsx
import { TButton } from 'tokiwagi-ui/react'
import 'tokiwagi-ui/button.css'

export function SaveButton({ onSave }: { onSave: () => void }) {
  return <TButton size="sm" tone="blue" leadingIcon="save" trailingIcon="check" onClick={onSave}>保存する</TButton>
}
```

Vueでは既定スロットと標準のイベントを使います。

```vue
<script setup lang="ts">
import { TButton } from 'tokiwagi-ui/vue'
import 'tokiwagi-ui/button.css'

const emit = defineEmits<{ save: [] }>()
</script>

<template>
  <form @submit.prevent="emit('save')">
    <TButton size="md" type="submit" tone="blue" leading-icon="save" trailing-icon="check" class="save-button">
      保存する
    </TButton>
  </form>
</template>

<style scoped>
.save-button { inline-size: min(100%, 375px); }
</style>
```

Astroでは静的なHTMLを出力し、フォームの送信または利用側のscriptで操作を接続します。

```astro
---
import { TButton } from 'tokiwagi-ui/astro'
import 'tokiwagi-ui/button.css'
---
<form method="post" action="/save">
  <TButton size="lg" type="submit" tone="blue" leadingIcon="save" trailingIcon="check" name="action" value="save">
    保存する
  </TButton>
</form>
```

| 指定 | 値と挙動 |
| --- | --- |
| `tone` | `neutral`、`neutral-0`、`neutral-600`、`neutral-800`、`neutral-900`、`green`、`teal`、`blue`、`violet`、`rose`、`coral`、`amber`。既定は `neutral`。有効なプライマリー色では背景に各色のトークンを使い、文字と装飾アイコンを白で表示する |
| `size` | `sm`、`md`、`lg`（既定）。文字・TIcon・高さ・余白を連動させる。inheritや未定義値は受け付けない |
| `weight` | TTextと共通の `TextWeight` 型。`normal`（400）、`medium`（500）、`semibold`（600）、`bold`（700）。省略時は親から継承し、文字列のinheritは受け付けない |
| `leadingIcon`・`trailingIcon` | どちらも省略可。既存の `IconName` を先頭・末尾の装飾アイコンとして表示 |
| children／既定スロット | 「保存する」などの操作名を表示 |
| `type` | `button`（既定）、`submit`、`reset` |
| `disabled` | 既定は `false`。有効にするとネイティブのボタンを無効化 |

| size | 文字 | TIcon | 最小高さ | 左右padding | gap |
| --- | --- | --- | --- | --- | --- |
| sm | 1.25rem | 20px | 40px | 12px | 6px |
| md | 1.5rem | 24px | 44px | 14px | 8px |
| lg | 1.75rem | 32px | 50px | 16px | 10px |

縦padding6px・角丸32pxは共通です。lgのアイコン外枠は40×32px、sm/mdは20×20px／24×24pxです。sizeを省略すると既存の文字のみ・先頭アイコン付きの寸法を維持します。前後に同じアイコンを指定してもIDを分離し、読み上げ名は文字ラベルだけから取得します。TLinkButtonとサイズの規則・CSSを共有しますが、TLinkButtonの角丸12px・リンクとしての動作も維持します。

`weight`はsizeとは独立して指定します。未指定時は親から継承し、明示値はTTextと同じ4段階です。`TextWeight`・`textWeights` は各方式の公開入口から利用できます。従来の700固定から変わるため、既存の未指定箇所も親の太さに応じて表示が変わります。以前の太字を保つ場合は `weight="bold"` を指定してください。Storybookのweight選択には未指定（継承）と4段階を用意し、方式切り替え・URL再読み込みでも設定を保持します。

```tsx
<TButton>親の太さを継承</TButton>
<TButton weight="semibold">保存する</TButton>
```

標準のボタン属性とReact・Vueのネイティブイベントは外側の `button` に渡します。AstroはHTMLのイベント属性や利用側のscriptを使用します。型を迂回した不正な色・size・weight・type・前後アイコン名・disabledは日本語エラーで検出します。フォームの送信・リセットとTab・Enter・Spaceのネイティブ操作を維持します。React 18/19・VueのSSRとハイドレーションには同じ内容・propsを使用し、アイコンのIDはTIconの方式に従います。Astroの表示にはクライアントJavaScriptは不要です。保存や送信の状態は利用側で管理します。

利用ルールは [TButtonの個別README](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TButton/README.md)、動作の見本はStorybookの「コンポーネント/TButton」にあります。

## ヘッダー共通部品

React・Vue・Astroの公開入口からTHeader・THeaderSection・THeaderButton・THeaderLink・THeaderButtonGroupと、それぞれのProps型、HeaderTone・headerTones・HeaderSectionPosition・HeaderBackgroundColor・headerBackgroundColorsを利用できます。利用側で `import 'tokiwagi-ui/header.css'` を一度追加してください。このCSSは必要なカラー・ニュートラル・書体トークンを読み込みます。Tailwind、Preflight、アプリのグローバルな要素リセットは不要です。

| 部品 | API・既定値 |
| --- | --- |
| THeader | Reactはchildren、Vue/Astroは既定slotにTHeaderSectionを配置。scrollLabelは既定「ヘッダー操作」。backgroundColorは全93トークン名、既定`--tkw-color-neutral-0` |
| THeaderSection | positionはleft / center / rightの必須指定。children／既定slotに内容を配置 |
| THeaderButton | toneはneutral / green / teal / blue / violet / rose / coral / amber、既定neutral。iconOnly・active・disabledは既定false。selectedは既定未指定。typeは既定button |
| THeaderLink | hrefは必須。tone・iconOnly・activeはTHeaderButtonと共通。現在地はaria-current。target=_blankではrelにnoopenerを補完 |
| THeaderButtonGroup | children／既定slotにTHeaderButton・THeaderLinkを直接配置。aria-labelまたはaria-labelledbyでグループ名を指定 |

ネイティブ属性、aria-*、data-*、className（React）／class（Vue・Astro）を対応する外側の要素へ渡します。React・Vueはネイティブイベントを接続できます。tone・iconOnly・active・selectedはDOMへそのまま転送せず表示状態に変換し、selectedを明示したときだけaria-pressedを設定します。selectedとaria-pressedの両方を渡した場合はselectedが優先します。グループのroleはgroupに固定します。不正なtone・type・boolean型・positionは描画時に日本語エラーで拒否します。positionはDOM属性に直接転送せず、配置を示すdata-positionに変換します。

backgroundColorは`--tkw-color-primary-blue-subtle`や`--tkw-color-secondary-navy`のように既存トークン名を指定します。任意のHEX値や`var(...)`は受け付けません。不正な値は描画時に日本語エラーで拒否し、DOMへはdata-backgroundとして出力します。選択肢はheaderBackgroundColors、型はHeaderBackgroundColorから参照できます。

継承文字色はneutral-900、neutral-0、neutral-1000の順に背景とのコントラスト比4.5:1以上の色を使います。THeader内のボタンの通常背景は透明です。toneの前景色が4.5:1未満なら読みやすい色へ調整し、ホバー・押下・選択・無効状態では既存の背景・前景の組を使います。通常のclass・styleも引き続き利用できますが、子要素に独自CSSで固定した色や、利用側で上書きしたトークン値のコントラストは利用側で確認してください。リンクにも継承色を使う場合は`color: inherit`を設定します。

THeaderの直下にTHeaderSectionをleft→center→rightの順で配置します。各位置は1つまでで、省略できます。左右は内容幅を取り、中央は残り幅の中央へ内容を揃えます。中央がなくても右側は右端へ、中央だけなら全幅の中央へ配置します。CSSでDOM順やフォーカス順を変更しません。従来のstart／end propsと名前付きslotは廃止し、この構成へ統一しました。

THeaderButton・THeaderLinkは`active`（boolean、既定false）で背景と下線を表示できます。マウス・タッチなどで押している間（CSSの`:active`）も下線を表示します。離すと元の状態へ戻り、`active`は自動変更しません。`active`は見た目だけを指定し、`aria-pressed`・`aria-current`を設定しません。選択状態は`selected`、現在地は`aria-current`で伝えてください。`active=false`でも既存の選択・現在地の下線は保持されます。disabledボタンは押下の下線を出さず、明示されたactive・selectedの下線は無効色で表示します。

```tsx
<THeaderButton active={isMenuOpen} aria-expanded={isMenuOpen}>メニュー</THeaderButton>
<THeaderLink href="/settings" active={isSettingsActive} aria-current={isSettingsActive ? 'page' : undefined}>設定</THeaderLink>
```

Vueでは`:active="isMenuOpen"`、Astroでは`active={isMenuOpen}`で指定できます。

ヘッダーは高さ36pxの1行表示です。幅が不足した場合は内部だけを横スクロールさせます。スクロール領域はキーボードでも操作できます。長いタイトルの省略、リンク先の決定、メニューの表示、日付計算、保存、固定配置は利用側の責任です。THeaderButtonは通常のbutton操作を使い、グループ内に独自の矢印キー制御を追加しません。

React:

```tsx
import { THeader, THeaderSection, THeaderButton, THeaderButtonGroup, TIcon } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/header.css';

<THeader backgroundColor="--tkw-color-primary-blue-subtle">
  <THeaderSection position="left">
    <THeaderButton iconOnly aria-label="メニューを開く" aria-expanded={open} onClick={() => setOpen(!open)}><TIcon name="menu" /></THeaderButton>
    <a href="/" style={{ color: 'inherit' }}>アプリ名</a>
  </THeaderSection>
  <THeaderSection position="center">カレンダー名</THeaderSection>
  <THeaderSection position="right">
    <THeaderButtonGroup aria-label="表示形式">
      <THeaderButton selected={view === 'month'} onClick={() => setView('month')}>月</THeaderButton>
      <THeaderButton selected={view === 'week'} onClick={() => setView('week')}>週</THeaderButton>
    </THeaderButtonGroup>
  </THeaderSection>
</THeader>
```

Vue:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { THeader, THeaderSection, THeaderButton, THeaderButtonGroup, TIcon } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/header.css';
const view = ref('month');
const open = ref(false);
</script>
<template>
  <THeader background-color="--tkw-color-primary-blue-subtle">
    <THeaderSection position="left">
      <THeaderButton icon-only aria-label="メニューを開く" :aria-expanded="open" @click="open = !open"><TIcon name="menu" /></THeaderButton>
      <a href="/" style="color: inherit">アプリ名</a>
    </THeaderSection>
    <THeaderSection position="center">カレンダー名</THeaderSection>
    <THeaderSection position="right">
      <THeaderButtonGroup aria-label="表示形式">
        <THeaderButton :selected="view === 'month'" @click="view = 'month'">月</THeaderButton>
        <THeaderButton :selected="view === 'week'" @click="view = 'week'">週</THeaderButton>
      </THeaderButtonGroup>
    </THeaderSection>
  </THeader>
</template>
```

Astro:

```astro
---
import { THeader, THeaderSection, THeaderButton, THeaderButtonGroup, TIcon } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/header.css';
---
<THeader backgroundColor="--tkw-color-secondary-navy">
  <THeaderSection position="left">
    <THeaderButton iconOnly aria-label="メニューを開く" data-action="menu"><TIcon name="menu" /></THeaderButton>
    <a href="/" style="color: inherit">アプリ名</a>
  </THeaderSection>
  <THeaderSection position="center">カレンダー名</THeaderSection>
  <THeaderSection position="right">
    <THeaderButtonGroup aria-label="表示期間の移動">
      <THeaderButton data-action="previous">前へ</THeaderButton>
      <THeaderButton data-action="today">今日</THeaderButton>
      <THeaderButton data-action="next">次へ</THeaderButton>
    </THeaderButtonGroup>
  </THeaderSection>
</THeader>
```

Astroは静的HTMLを出力します。操作は利用側のscriptでdata-actionなどにイベントを接続してください。React/VueのコールバックをAstroのHTML属性に渡す方式ではありません。React・VueはSSRとハイドレーションを利用でき、ヘッダー自体はIDを自動生成しません。aria-controlsなどで使うIDは利用側で一意に指定してください。


### ヘッダーリンク

THeaderLinkはhrefを持つa要素です。hrefは相対URL・絶対URL・フラグメントに対応し、未指定・空文字・空白のみは日本語エラーになります。toneは既定neutral、iconOnlyは既定falseです。アイコンのみではaria-labelまたはaria-labelledbyを指定してください。現在地は利用側がaria-currentで指定し、page・locationなどで背景と下線を表示します。selected・disabledは提供しません。

ネイティブのリンク属性・class・data属性・aria属性を転送します。targetが_blankの場合、relからopenerを除き、他の値を保持してnoopenerを補完します。noreferrerは自動追加しません。Tab・Enter・修飾キー・中央クリック・右クリックによる標準のリンク操作を維持します。React・Vueはネイティブイベントを転送し、Astroは利用側scriptで接続します。ルーター連携や現在URLの自動判定は利用側の責任です。

React:

```tsx
import { THeaderLink, TIcon } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/header.css';

<THeaderLink href="/calendar" aria-current="page">カレンダー</THeaderLink>
<THeaderLink href="/settings" iconOnly aria-label="設定"><TIcon name="setting" /></THeaderLink>
<THeaderLink href="https://example.com/help" target="_blank">ヘルプ（別タブ）</THeaderLink>
```

Vue:

```vue
<script setup lang="ts">
import { THeaderLink, TIcon } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/header.css';
</script>

<template>
  <THeaderLink href="/calendar" aria-current="page">カレンダー</THeaderLink>
  <THeaderLink href="/settings" icon-only aria-label="設定"><TIcon name="setting" /></THeaderLink>
  <THeaderLink href="https://example.com/help" target="_blank">ヘルプ（別タブ）</THeaderLink>
</template>
```

Astro:

```astro
---
import { THeaderLink, TIcon } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/header.css';
---
<THeaderLink href="/calendar" aria-current="page">カレンダー</THeaderLink>
<THeaderLink href="/settings" iconOnly aria-label="設定"><TIcon name="setting" /></THeaderLink>
<THeaderLink href="https://example.com/help" target="_blank">ヘルプ（別タブ）</THeaderLink>
```

THeaderSection、THeaderButtonGroup内へ直接配置できます。グループ内ではTHeaderButtonと混在しても境界線が揃います。SSR・ハイドレーションを使う場合は、サーバーとクライアントで同じhref・aria-current・targetを指定してください。リンク自体はIDや遷移処理を生成しません。

## TText

React・Vue・Astroの各入口から`TText`・`TTextProps`と、`TextOptions`・`TextSize`・`TextResponsiveSize`・`TextWeight`・`TextTone`・`TextTag`・`TextAlign`・`TextWhiteSpace`・`TextDecoration`を利用できます。選択肢の`textSizes`・`textWeights`・`textTones`も公開します。

利用側で`tokiwagi-ui/text.css`を一度読み込みます。必要なフォント・ニュートラル・状態色のトークンを含み、グローバルリセットは追加しません。既存コンポーネントの設定には影響しません。

| 設定 | 指定値 | 既定 |
| --- | --- | --- |
| as | span / p | span |
| size | sm / md / lg、または { base, sm?, lg? } | md |
| weight | normal / medium / semibold / bold | normal |
| lineHeight | 有限の正の数値による倍率 | 1.5 |
| tone | default / muted / inherit / success / warning / error / info | default |
| align | start / center / end | start |
| truncate | boolean。1行で末尾省略 | false |
| lineClamp | 正の整数。最大表示行数 | 未指定 |
| whiteSpace | normal / pre-line / pre-wrap | normal |
| inherit | 書体・サイズ・太さ・行高を親から継承 | false |
| italic | boolean | false |
| decoration | none / underline / line-through | none |

サイズは0.875/1/1.125remで、ルート16px時は14/16/18pxです。レスポンシブサイズはbaseを必須とし、640px以上でsm、1024px以上でlgを適用します。未指定の段階は直前の値を引き継ぎます。表示幅の判定はCSSで行います。

inherit時も、明示したsize・weight・lineHeightは優先されます。色の継承にはtone="inherit"を使います。truncateとlineClampの同時指定、不正な列挙値・数値は3方式で同じ日本語エラーになります。

### React

```tsx
import { TText } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/text.css';

<TText as="p" size={{ base: 'sm', sm: 'md', lg: 'lg' }} id="task-description">
  開始前に<strong>開催場所</strong>を確認してください。
</TText>
<TText as="p" size="sm" tone="muted">変更内容は自動で保存されます。</TText>
<TText as="p" tone="error" aria-live="polite">保存に失敗しました。</TText>
<TText as="p" lineClamp={3} style={{ maxWidth: 320 }}>長い説明文を表示します。</TText>
```

### Vue

```vue
<script setup lang="ts">
import { TText } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/text.css';
</script>

<template>
  <TText as="p" :size="{ base: 'sm', sm: 'md', lg: 'lg' }">
    開始前に<strong>開催場所</strong>を確認してください。
  </TText>
  <TText as="p" tone="error" aria-live="polite">保存に失敗しました。</TText>
  <TText as="p" :line-clamp="3" style="max-width: 320px">長い説明文を表示します。</TText>
</template>
```

### Astro

```astro
---
import { TText } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/text.css';
const memo = '今日の予定\n  開催場所を確認する';
---

<TText as="p" size={{ base: 'sm', sm: 'md', lg: 'lg' }}>
  開始前に<strong>開催場所</strong>を確認してください。
</TText>
<TText as="p" whiteSpace="pre-wrap">{memo}</TText>
<TText as="p" lineClamp={3} style="max-width: 320px">長い説明文を表示します。</TText>
```

Reactはchildren、Vue・Astroはデフォルトslotを使います。空文字やHTML風の文字列も扱え、通常の文字列をHTMLとして解釈しません。AstroのslotにHTMLを記述した場合は通常どおり要素として描画します。利用側がraw HTML挿入APIを使う場合は、入力の安全性を利用側で保証してください。

標準のid・title・aria-*・data-*・class（ReactはclassName）・styleなどを外側へ転送します。React・Vueのネイティブイベントも転送します。Astroのイベントは標準HTML属性や利用側のスクリプトで扱い、React/Vueの関数イベントは受け取りません。ref転送は公開しません。SSRに対応し、React・Vueはハイドレーション後の設定更新に対応します。Astroの通常表示にはclient:*指定やクライアントJavaScriptは不要です。

通常は長い日本語・URLを折り返し、余白は0です。段落はp、文中の一部はspanを使います。alignは要素内の文字揃えで、span自体の配置は親で調整します。省略を使う場合は親などで幅を制限し、詳細画面などに全文を確認できる導線を用意してください。DOM内の全文は保持します。truncateはwhiteSpaceより優先されます。操作要素を含む文章の省略は避けてください。

固定toneは白・neutral-50背景でコントラスト4.5:1以上を検証します。継承色・任意の背景・利用側のstyle上書きは、組み合わせを利用側で確認してください。状態は色に加えて文言でも伝えます。見た目の太字・斜体と文章の意味は分け、必要に応じてstrong・em等を含めます。

利用ルールは[TTextの個別README](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TText/README.md)、見本はStorybook「コンポーネント/TText」を参照してください。


## TCard

React・Vue・Astroの公開入口から、ひとつの話題をまとめるTCardと構造パーツを使えます。利用側で `tokiwagi-ui/card.css` を一度読み込みます。必要なニュートラル色と共通フォントは同CSSが読み込みます。カラー値は既存トークンを参照し、角丸は12px、すべてのvariantにTButtonと同じ影（右2px・下2px・ぼかし4px・黒25%）を使います。

| 部品 | 要素・設定 | 用途 |
| --- | --- | --- |
| TCard | as: div（既定）/article/section | カード全体。variantはoutline（既定）/elevated/subtle、sizeはsm/md（既定）/lg |
| TCardHeader | div | 見出し・説明の配置 |
| TCardTitle | as: h1〜h6、既定h3 | ページの見出し階層に合わせたタイトル |
| TCardDescription | p | 補足説明 |
| TCardBody | div | 本文。本文だけのカードも作成可能 |
| TCardFooter | div | 補足・操作。幅不足時は折り返す |
| TCardMedia | div | 画像・動画。直接のimg/videoは全幅・高さautoで表示 |
| TCardActionArea | href必須のa | カード全体、または主操作の領域のリンク |

outlineは枠線付きの白背景、elevatedは枠線なしの白背景、subtleは枠線なしのneutral-100背景です。sizeは内側余白12/16/24pxと本文前の間隔8/12/16pxを変え、文字サイズやカードの幅を変えません。幅・高さ・一覧の列数は利用側で指定します。未定義のvariant・size・as、見出し以外のTCardTitle.as、空白だけのhrefは3方式とも日本語エラーにします。

各部品は対応するHTML要素の標準属性、ReactのclassName／Vue・Astroのclass、style、children／既定slotを保持します。React・Vueではネイティブイベントを転送します。Astroは追加のscript・ハイドレーションなしで静的HTMLを出力し、操作は利用側のscriptやフォームで接続します。アプリ向けの公開入口にはStorybook専用コードを含めません。

TCardProps・TCardHeaderProps・TCardTitleProps・TCardDescriptionProps・TCardBodyProps・TCardFooterProps・TCardMediaProps・TCardActionAreaPropsを各方式の入口から公開します。共通のCardVariant・CardSize・CardTag・CardTitleTag・CardDataAttributes・CardOptions・CardTitleOptions・CardActionAreaOptions型と、cardVariants・cardSizes・cardTags・cardTitleTags一覧も公開します。

Reactの基本例です。IDは親のuseIdで作り、複数カードの見出し参照を分けます。

```tsx
import { useId } from 'react';
import {
  TCard, TCardHeader, TCardTitle, TCardDescription,
  TCardBody, TCardFooter, TLink,
} from 'tokiwagi-ui/react';
import 'tokiwagi-ui/card.css';
import 'tokiwagi-ui/link.css';

export function ProjectCard() {
  const titleId = useId();
  return (
    <TCard as="article" variant="outline" size="md"
      aria-labelledby={titleId} style={{ maxWidth: 414 }}>
      <TCardHeader>
        <TCardTitle as="h3" id={titleId}>デザインシステムを整える</TCardTitle>
        <TCardDescription>Tokiwagi UI / コンポーネント設計</TCardDescription>
      </TCardHeader>
      <TCardBody>チームで使うUIの見た目と振る舞いを揃えます。</TCardBody>
      <TCardFooter>
        <span>更新：今日</span>
        <TLink href="/projects/design-system">詳細を見る</TLink>
      </TCardFooter>
    </TCard>
  );
}
```

Vueの全体リンク例です。内部には別のリンク・ボタン・入力欄を入れません。複数の操作が必要なカードでは全体リンクを使わず、フッターなどに独立した操作要素を置きます。

```vue
<script setup lang="ts">
import { useId } from 'vue';
import { TCard, TCardActionArea, TCardHeader, TCardTitle, TCardBody } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/card.css';
const titleId = useId();
</script>

<template>
  <TCard variant="subtle" size="lg" :aria-labelledby="titleId">
    <TCardActionArea href="/guides/getting-started">
      <TCardHeader>
        <TCardTitle :id="titleId" as="h3">はじめてのTokiwagi UI</TCardTitle>
      </TCardHeader>
      <TCardBody>基本の考え方から、コンポーネントの使い方まで。</TCardBody>
    </TCardActionArea>
  </TCard>
</template>
```

Astroのメディア例です。画像のalt・高さ・トリミングは用途に合わせて指定します。静的出力のIDは親で一意にします。

```astro
---
import { TCard, TCardMedia, TCardHeader, TCardTitle, TCardBody } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/card.css';
const titleId = `card-${crypto.randomUUID()}`;
---
<TCard as="article" variant="elevated" aria-labelledby={titleId}>
  <TCardMedia>
    <img src="/images/card-layout.webp" alt="余白を取って並べた2枚のカード" loading="lazy" />
  </TCardMedia>
  <TCardHeader><TCardTitle id={titleId}>余白から考える、UI設計。</TCardTitle></TCardHeader>
  <TCardBody>読みやすく、操作しやすい画面のために。</TCardBody>
</TCard>
```

TCardActionAreaのtarget・rel・aria-currentはネイティブのリンク属性です。target=_blankでは大文字・小文字を区別せず、relのopenerを除きnoopenerを補います。他のrelは保持します。URLの決定・検証とルーター連携・現在地の判定は利用側が担います。disabledは提供しません。

完了・選択・保存状態や読み込み処理はカードに内包しません。チェックボックス・ラジオボタン・ボタンなどの状態を利用側で管理し、読み込み中はaria-busyとスケルトンや案内を組み合わせます。タイトル・状態・画像の意味を色だけに依存させず、フォーカス輪郭を隠さないでください。

利用ルールは[TCardの個別README](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TCard/README.md)、見本はStorybook「コンポーネント/TCard」を参照してください。


## サイドバー

`TSidebarLayout`・`TSidebar`・`TSidebarMain`・`TSidebarHeader`・`TSidebarBody`・`TSidebarFooter`と各Props型を`tokiwagi-ui/react`・`tokiwagi-ui/vue`・`tokiwagi-ui/astro`から公開します。`tokiwagi-ui/sidebar.css`を一度読み込みます。CSSは既存のニュートラル・書体トークンを読み込みます。各方式で設定名・既定値・意味を揃えます。

| 部品・設定 | 型・既定値 | 内容 |
| --- | --- | --- |
| Layout `gap` | number、24 | サイドバーと中央の間隔（px）。0以上の有限数 |
| Layout `animationDuration` | number、200 | 幅と間隔の遷移時間（ms）。0以上の有限数。0で即時 |
| Sidebar `side` | left/right、必須 | 左右の配置 |
| Sidebar `open` | boolean、true | 利用側が管理する表示状態 |
| Sidebar `width` | number、280 | 開いた幅（px）。0より大きい有限数 |
| Sidebar `as` | aside/div、aside | 外側の要素 |
| Main `as` | div/main、div | 中央の要素 |
| Header/Body/Footer | 固有設定なし | divによる情報の配置 |
| 全部品 | children・標準属性・ネイティブイベント | 内容、id、ReactのclassName／Vue・Astroのclass、style、aria/data属性を外側へ転送 |

Layoutの直下は左のSidebar→Main→右のSidebarの順で配置し、Mainを1つ、左右はそれぞれ最大1つにします。Fragment・配列・条件付き省略に対応し、重複・順序違反・別ラッパーは日本語エラーになります。SidebarSide・SidebarTag・SidebarMainTag・SidebarLayoutOptions・SidebarOptions・SidebarMainOptionsと選択肢のsidebarSides・sidebarTags・sidebarMainTagsも各入口から公開します。

```tsx
import { useId, useState } from 'react';
import { TSidebarLayout, TSidebar, TSidebarMain, TSidebarHeader, TSidebarBody, TSidebarFooter } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/sidebar.css';

function Example() {
  const leftId = useId();
  const rightId = useId();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  return <TSidebarLayout gap={24} animationDuration={200}>
    <TSidebar side="left" open={leftOpen} id={leftId} aria-label="目次">
      <TSidebarHeader>目次</TSidebarHeader>
      <TSidebarBody><nav aria-label="ページ内移動"><a href="#guide">ガイドライン</a></nav></TSidebarBody>
    </TSidebar>
    <TSidebarMain as="main">
      <button type="button" aria-controls={leftId} aria-expanded={leftOpen}
        onClick={() => setLeftOpen(value => !value)}>左の目次を切り替え</button>
      <button type="button" aria-controls={rightId} aria-expanded={rightOpen}
        onClick={() => setRightOpen(value => !value)}>右の補足情報を切り替え</button>
      <h1 id="guide">ガイドライン</h1>
    </TSidebarMain>
    <TSidebar side="right" width={240} open={rightOpen} id={rightId} aria-label="補足情報">
      <TSidebarBody>任意の情報を配置できます。</TSidebarBody>
      <TSidebarFooter>補足</TSidebarFooter>
    </TSidebar>
  </TSidebarLayout>;
}
```

開くとサイドバーの占有幅と間隔が増え、中央領域が縮みます。閉じると両方が0になります。内容のDOMは維持し、閉鎖中はinertとaria-hiddenで操作・読み上げを抑止します。動きを減らすOS設定では即座に切り替えます。React・VueはSSRとハイドレーションに対応します。React 18では文字列、React 19ではbooleanのinert属性を内部で描画します。Astroは静的HTMLで初期状態を描画し、利用側のscriptがdata-open・inert・aria-hiddenと開閉ボタンのaria-expandedを更新します。

開閉ボタン・状態変更・現在地・リンク先・フォーカスの戻し先は利用側が管理します。ボタンは閉じた後も操作できる位置に置き、プログラムから閉じる際に内部にフォーカスがある場合は先に外側へ移します。画面固定、スクロールの高さ、狭い画面での幅・表示・縦配置は利用側のCSSと状態で調整します。アニメーション中を含めて中央に重ね表示しません。

`/colors/`は公開Astro部品を直接使い、デスクトップでは中央のボタンで左側を開閉します。React連携やハイドレーションは不要です。モバイルでは従来のdetailsによる目次を使い、目次リンク・スクロール現在地・グループ開閉・サイドバー状態はページのscriptで管理します。

利用ルールは[TSidebarLayout](https://github.com/HikariTakahashi/tokiwagi-ui/blob/main/components/TSidebarLayout/README.md)と各部品の個別README、見本はStorybook「コンポーネント/サイドバー」を参照してください。


Vueではopenを利用側のrefで管理します。

```vue
<script setup lang="ts">
import { ref, useId } from 'vue';
import { TSidebarLayout, TSidebar, TSidebarMain, TSidebarBody } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/sidebar.css';
const open = ref(true);
const sidebarId = useId();
</script>

<template>
  <TSidebarLayout>
    <TSidebar side="left" :open="open" :id="sidebarId" aria-label="目次">
      <TSidebarBody><a href="#guide">ガイドライン</a></TSidebarBody>
    </TSidebar>
    <TSidebarMain as="main">
      <button type="button" :aria-controls="sidebarId" :aria-expanded="open" @click="open = !open">目次を切り替え</button>
      <h1 id="guide">ガイドライン</h1>
    </TSidebarMain>
  </TSidebarLayout>
</template>
```

Astroでは公開部品に渡すopenが初期値です。次のように利用側で状態と操作を接続します。複数置く場合はIDと操作の対象をそれぞれ分けてください。

```astro
---
import { TSidebarLayout, TSidebar, TSidebarMain, TSidebarBody } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/sidebar.css';
---
<TSidebarLayout>
  <TSidebar side="left" id="example-sidebar" aria-label="目次">
    <TSidebarBody><a href="#guide">ガイドライン</a></TSidebarBody>
  </TSidebar>
  <TSidebarMain as="main">
    <button type="button" data-sidebar-toggle aria-controls="example-sidebar" aria-expanded="true">目次を切り替え</button>
    <h1 id="guide">ガイドライン</h1>
  </TSidebarMain>
</TSidebarLayout>
<script>
  const sidebar = document.getElementById('example-sidebar');
  const button = document.querySelector<HTMLButtonElement>('[data-sidebar-toggle]');
  button?.addEventListener('click', () => {
    if (!sidebar) return;
    const open = sidebar.dataset.open !== 'true';
    if (!open && sidebar.contains(document.activeElement)) button.focus();
    sidebar.dataset.open = String(open);
    sidebar.toggleAttribute('inert', !open);
    if (open) sidebar.removeAttribute('aria-hidden');
    else sidebar.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-expanded', String(open));
  });
</script>
```
