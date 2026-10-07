import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { createApp, h, shallowRef } from 'vue';
import { TIcon as ReactTIcon, iconNames, type IconName, type IconSize } from 'tokiwagi-ui/react';
import { TIcon as VueTIcon } from 'tokiwagi-ui/vue';
import { iconSizes } from '../../lib/icon-assets';
import { colors } from '../../lib/palette';
import { astroPreviewSvg, type AstroIconPreviews } from './astro-preview';
import { DocumentationPage, DocumentationSection, PreviewControls, ControlField, PreviewStage, CodeBlock, PropsTable, AstroPreviewStatus, useAstroPreviews, componentExample, type Framework } from './ComponentDocumentation';
import astroPreviewsUrl from 'virtual:tkw-astro-icons';
import { createAstroPreviewLoader } from './astro-preview-loader';

import './ticon-documentation.css';

type SampleProps = { name: IconName; size?: IconSize; color?: string };

// Vueの実コンポーネントをDocs内にマウントする。Reactの再描画時も同じVueアプリのpropsを更新する。
function VueSample({ name, size = 24, color = 'currentColor' }: SampleProps) {
  const host = useRef<HTMLSpanElement>(null);
  const id = useId();
  const [props] = useState(() => shallowRef({ name, size, color }));
  useEffect(() => { props.value = { name, size, color }; }, [props, name, size, color]);
  useEffect(() => {
    const app = createApp({ render: () => h(VueTIcon, props.value) });
    app.config.idPrefix = `ticon-doc-${id}`;
    app.mount(host.current!);
    return () => app.unmount();
  }, [id, props]);
  return <span ref={host} className="tkw-doc-sample-host" />;
}

const AstroPreviewsContext = createContext<AstroIconPreviews | null>(null);
const loadAstroPreviews = createAstroPreviewLoader<AstroIconPreviews>(astroPreviewsUrl);

function AstroSample({ name, size = 24, color = 'currentColor' }: SampleProps) {
  const previews = useContext(AstroPreviewsContext);
  const id = useId();
  const prefix = `tkw-astro-doc-${Array.from(id, char => char.codePointAt(0)!.toString(16)).join('-')}`;
  return <span className="tkw-doc-sample-host" style={{ color }} aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: previews ? astroPreviewSvg(previews, name, size, prefix) : '' }} />;
}

function SampleIcon({ framework, ...props }: SampleProps & { framework: Framework }) {
  if (framework === 'astro') return <AstroSample {...props} />;
  return framework === 'react' ? <ReactTIcon {...props} /> : <VueSample {...props} />;
}

const basicExamples = {
  astro: `---
import { TIcon } from 'tokiwagi-ui/astro';
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';
---
<button type="button" aria-label="通知一覧を開く">
  <TIcon name="bell" size={24} class="notification-icon" />
</button>
<a href="/tasks"><TIcon name="task" size={20} /> タスク一覧</a>
<span><TIcon name="check" size={20} /> 完了</span>
<button type="button" disabled><TIcon name="save" size={20} /> 保存済み</button>`,
  react: `import { TIcon } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';

export function Actions() {
  return <>
    <button type="button" aria-label="通知一覧を開く">
      <TIcon name="bell" size={24} className="notification-icon" />
    </button>
    <button type="button"><TIcon name="plus" size={20} /> タスクを追加</button>
    <span><TIcon name="check" size={20} /> 完了</span>
    <button type="button" disabled><TIcon name="save" size={20} /> 保存済み</button>
  </>;
}`,
  vue: `<script setup lang="ts">
import { TIcon } from 'tokiwagi-ui/vue';
import 'tokiwagi-ui/tokens/colors.css';
import 'tokiwagi-ui/tokens/semantic.css';
</script>

<template>
  <button type="button" aria-label="通知一覧を開く">
    <TIcon name="bell" :size="24" class="notification-icon" />
  </button>
  <button type="button"><TIcon name="plus" :size="20" /> タスクを追加</button>
  <span><TIcon name="check" :size="20" /> 完了</span>
  <button type="button" disabled><TIcon name="save" :size="20" /> 保存済み</button>
</template>`,
};

const ssrExamples = {
  astro: `---
import { TIcon } from 'tokiwagi-ui/astro';
---
<!-- 静的ビルド／サーバー描画時にIDを生成。client:*は不要。 -->
<TIcon name="moon" size={24} />
<TIcon name="moon" size={32} />
<TIcon name="tool" size={24} />`,
  react: `// サーバー側：htmlをsidebar-root要素の内側に出力する。
import { renderToString } from 'react-dom/server';
import { TIcon } from 'tokiwagi-ui/react';
const html = renderToString(<TIcon name="moon" />, { identifierPrefix: 'sidebar-' });

// クライアント側：サーバーと同じツリー・接頭辞を使用する。
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('sidebar-root')!, <TIcon name="moon" />, {
  identifierPrefix: 'sidebar-',
});`,
  vue: `// サーバー側：htmlをsidebar-root要素の内側に出力する。
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TIcon } from 'tokiwagi-ui/vue';
const app = createSSRApp({ render: () => h(TIcon, { name: 'moon' }) });
app.config.idPrefix = 'sidebar-';
const html = await renderToString(app);

// クライアント側：サーバーと同じツリー・接頭辞を使用する。
const clientApp = createSSRApp({ render: () => h(TIcon, { name: 'moon' }) });
clientApp.config.idPrefix = 'sidebar-';
clientApp.mount('#sidebar-root');`,
};

export function TIconDocumentation() {
  const [framework, setFramework] = useState<Framework>('react');
  const [name, setName] = useState<IconName>('bell');
  const [size, setSize] = useState<IconSize>(24);
  const [color, setColor] = useState('inherit');
  const [count, setCount] = useState(0);
  const { previews: astroPreviews, error, retry } = useAstroPreviews(framework, loadAstroPreviews);
  const foreground = color === 'inherit' ? 'currentColor' : `var(--tkw-color-primary-${color}-on-subtle)`;
  const background = color === 'inherit' ? 'var(--tkw-color-neutral-50)' : `var(--tkw-color-primary-${color}-subtle)`;
  const packageName = `tokiwagi-ui/${framework}`;
  const colorProp = color === 'inherit' ? '' : ` color="${foreground}"`;
  const previewCode = componentExample(framework, 'TIcon', `<TIcon name="${name}" ${framework === 'vue' ? `:size="${size}"` : `size={${size}}`}${colorProp} />`, color === 'inherit' ? [] : ['colors']);

  return <AstroPreviewsContext.Provider value={astroPreviews}><DocumentationPage name="TIcon" framework={framework} onFrameworkChange={setFramework}
    description="全329個のアイコンを、サイズとトークン色を揃えて表示する装飾用コンポーネントです。意味は併記テキスト、操作名は親のbutton/linkで伝えます。">
    <DocumentationSection name="preview">
      <p>フレームワークを切り替えると、実際のコンポーネントと使用コードが切り替わります。選択した公開名・サイズ・色は維持します。</p>
      <AstroPreviewStatus framework={framework} ready={astroPreviews !== null} error={error} retry={retry} />
      <PreviewControls>
        <ControlField label="公開名"><select value={name} onChange={event => setName(event.target.value as IconName)}>
          {iconNames.map(value => <option key={value} value={value}>{value}</option>)}
        </select></ControlField>
        <ControlField label="サイズ"><select value={size} onChange={event => setSize(Number(event.target.value) as IconSize)}>
          {iconSizes.map(value => <option key={value} value={value}>{value}px</option>)}
        </select></ControlField>
        <ControlField label="色"><select value={color} onChange={event => setColor(event.target.value)}>
          <option value="inherit">親の文字色を継承</option>
          {colors.map(([value, label]) => <option key={value} value={value}>{label} / 淡い背景</option>)}
        </select></ControlField>
      </PreviewControls>
      <PreviewStage label="選択したTIconの見本" style={{ background }}><SampleIcon framework={framework} name={name} size={size} color={foreground} /></PreviewStage>
      <p className="tkw-doc-note">{name} · {size}×{size}px · {color === 'inherit' ? '親の文字色を継承' : `${color} / 淡い背景`}</p>
      <CodeBlock code={previewCode} />
      <details className="tkw-doc-comparisons">
        <summary>サイズ・7色・複数表示を比較</summary>
        <h3>4サイズ</h3>
        <div className="tkw-ticon-sizes">{iconSizes.map(value => <figure key={value}>
          <SampleIcon framework={framework} name={name} size={value} color={foreground} /><figcaption>{value}px</figcaption>
        </figure>)}</div>
        <h3>7色のプライマリー</h3>
        <div className="tkw-ticon-colors">{colors.map(([value, label]) => <div key={value}
          style={{ background: `var(--tkw-color-primary-${value})`, color: `var(--tkw-color-primary-${value}-on)` }}>
          <SampleIcon framework={framework} name={name} /><span>{label}</span>
        </div>)}</div>
        <h3>クリッピングと線・塗り</h3>
        <p>moonとtoolを繰り返し表示し、likeの塗りも確認できます。</p>
        <div className="tkw-ticon-repeated">{(['moon', 'tool', 'like'] as const).map(value => <div key={value}>
          <span>{value}</span>{iconSizes.map(iconSize => <SampleIcon framework={framework} key={iconSize} name={value} size={iconSize} color="var(--tkw-color-primary-violet-on-subtle)" />)}
        </div>)}</div>
      </details>
    </DocumentationSection>

    <DocumentationSection name="basic">
      <p>色トークンはアプリ全体で一度読み込みます。{framework === 'react' ? 'クラスはclassName、サイズは数値で指定します。' : framework === 'vue' ? 'クラスはclass、サイズは :size="20" のように数値で渡します。' : 'クラスは文字列のclass、サイズは size={20} のように数値で渡します。'}</p>
      <CodeBlock code={basicExamples[framework]} />
    </DocumentationSection>

    <DocumentationSection name="api">
      <PropsTable rows={[
        { name: 'name', description: <><code>IconName</code> · 全329公開名</>, defaultValue: '必須' },
        { name: 'size', description: <><code>16 | 20 | 24 | 32</code> · 正方形の表示サイズ</>, defaultValue: '24' },
        { name: 'color', description: <><code>string</code> · 親の文字色または既存トークン</>, defaultValue: <code>currentColor</code> },
        { name: framework === 'react' ? 'className' : 'class', description: framework === 'vue' ? '文字列・配列・オブジェクト · Vueのクラス指定' : 'string · 配置用クラス', defaultValue: 'なし' },
      ]} />
      <p><code>TIconProps</code>、<code>IconName</code>、<code>IconSize</code>、<code>iconNames</code>、<code>isIconName</code>も同じ公開入口から利用できます。ReactのclassNameは文字列、Vueのclassは文字列・配列・オブジェクト、Astroのclassは文字列に対応します。</p>
      <p>存在しない名前と非対応サイズは型検査と日本語の実行時エラーで検出します。代替図柄へ暗黙に置き換えません。追加属性・イベント・{framework === 'react' ? 'children・ref' : 'slot'}は転送しません。</p>
    </DocumentationSection>

    <DocumentationSection name="rules">
      <ul>
        <li>32×32のviewBoxと原本の座標・線幅・縦横比を保持します。クラスでサイズや線幅を上書きしません。</li>
        <li>黒い線と塗りだけをcurrentColorに変換し、透明な塗りと白いクリッピングを保持します。</li>
        <li>通常の色背景には同色の<code>-on</code>、淡い背景には<code>-on-subtle</code>を組み合わせます。</li>
        <li>16pxで細部が判別しにくい場合は24px・32pxへ上げ、ラベルを併記します。全図柄の16px利用を一律に推奨しません。</li>
        <li><code>-off</code>は図柄が表す状態です。ボタンのdisabledや操作の可否とは区別します。</li>
      </ul>
    </DocumentationSection>

    <DocumentationSection name="accessibility">
      <p>SVGは<code>aria-hidden="true"</code>・<code>focusable="false"</code>で装飾として扱います。アイコンだけの操作には親のbutton/linkに目的が分かる読み上げ名を付け、状態はテキストでも伝えます。</p>
      <div className="tkw-ticon-actions">
        <button type="button" onClick={() => setCount(value => value + 1)}><SampleIcon framework={framework} name="plus" size={20} />タスクを追加</button>
        <button type="button" aria-label="通知一覧を開く" onClick={() => setCount(value => value + 1)}><SampleIcon framework={framework} name="bell" /></button>
        <button type="button" disabled><SampleIcon framework={framework} name="save" size={20} />保存済み</button>
      </div>
      <p role="status">操作回数: {count}</p>
      <p><SampleIcon framework={framework} name="check" size={20} color="var(--tkw-color-semantic-success-on-subtle)" /> 完了：状態は文言でも伝えます。</p>
      <p>操作領域・フォーカス・ホバー・押下・無効状態は親が担います。Tabで移動し、Enter／Spaceで操作できます。</p>
    </DocumentationSection>

    <DocumentationSection name="advanced">
      <details>
        <summary>導入・応用（インストール・外部データ・SSR）</summary>
        <h3>ローカルパッケージの導入</h3>
        <p>Viteの<code>?raw</code>読み込みに対応する環境が対象です。npm公開・配布ビルドは未実施です。icons/・src/・tokens/を含むリポジトリ全体を参照し、利用するフレームワークをアプリ側に導入します。</p>
        <CodeBlock code={`bun add ../tokiwagi-ui\n# npmの場合\nnpm install ../tokiwagi-ui`} />
        {framework === 'astro' ? <p>Astro/Viteの.astroと?raw読み込みを使用します。React・Vueの導入や重複ロード対策は不要です。このリポジトリのAstro 7.3.4で検証しています。</p> : <>
          <p>{framework === 'react' ? 'ReactとReact DOMは対応する同じバージョンを使用し、重複ロードを避けます。' : 'Vueの重複ロードを避けます。Nuxtでは vite.resolve.dedupe に指定します。'}</p>
          <CodeBlock code={framework === 'react' ? `// vite.config.ts\nresolve: { dedupe: ['react', 'react-dom'] }` : `// vite.config.ts\nresolve: { dedupe: ['vue'] }\n\n// nuxt.config.ts\nvite: { resolve: { dedupe: ['vue'] } }`} />
        </>}
        <h3>外部文字列を検証する</h3>
        <p>APIなどから受け取る文字列はisIconNameで検証します。必要な代替名は利用側で明示します。</p>
        <CodeBlock code={`import { isIconName, type IconName } from '${packageName}';\nconst fromApi: string = 'calendar';\nconst safeName: IconName = isIconName(fromApi) ? fromApi : 'help';`} />
        <h3>{framework === 'astro' ? '静的出力・サーバー描画' : 'SSR・複数root／アプリ'}</h3>
        {framework === 'astro' ? <p>クリッピングIDは描画時にcrypto.randomUUID()でインスタンスごとに生成し、出力HTMLに保存します。ビルドごとにID文字列は変わります。ハイドレーションは不要で、client:*は指定しません。同一ページに同じ図柄を複数置くための追加設定も不要です。</p> : <>
          <p>クリッピングIDはuseIdでインスタンスごとに分離します。サーバーとクライアントで同じコンポーネントツリーを描画してください。単一{framework === 'react' ? 'root' : 'アプリ'}では追加設定は不要です。</p>
          <p>{framework === 'react' ? '同じ文書に複数rootを置くときはidentifierPrefixをrootごとに分け、SSRとクライアントで同じ値を使います。クライアント描画だけならcreateRootのオプションにも指定できます。' : '同じ文書に複数Vueアプリを置くときはapp.config.idPrefixをアプリごとに分け、SSRとクライアントで同じ値を使います。'}</p>
        </>}
        <CodeBlock code={ssrExamples[framework]} />
        <a href={framework === 'astro' ? 'https://docs.astro.build/en/basics/astro-components/' : framework === 'react' ? 'https://react.dev/reference/react/useId' : 'https://vuejs.org/api/composition-api-helpers.html#useid'}>{framework === 'astro' ? 'Astroコンポーネントの公式仕様' : 'useIdの公式仕様'}</a>
      </details>
    </DocumentationSection>

    <DocumentationSection name="related">
      <p>図柄の選び方や各アイコンの用途・使用ルールは、一覧と個別ページから確認できます。bellの詳細ルールは確定済み、ほかは詳細ルール案です。</p>
      <div className="tkw-doc-related">
        <a href="./?path=/docs/アイコン-アイコン名および用途--docs" target="_top">アイコン一覧・各図柄の用途</a>
        <a href="./?path=/docs/アイコン-命名基準--docs" target="_top">命名基準</a>
        <a href="./?path=/docs/icons-display--docs" target="_top">共通表示ルール</a>
        <a href="./?path=/docs/components-documentation-rules--docs" target="_top">ドキュメントUIルール</a>
      </div>
    </DocumentationSection>
  </DocumentationPage></AstroPreviewsContext.Provider>;
}
