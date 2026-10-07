import { useEffect, useRef, useState } from 'react';
import { createApp, h, shallowRef } from 'vue';
import { TBrand as ReactTBrand, type LogoSize } from 'tokiwagi-ui/react';
import { TBrand as VueTBrand } from 'tokiwagi-ui/vue';
import { logoSizes } from '../../lib/logo';
import type { AstroBrandPreviews } from '../astro-brand-previews';
import { DocumentationPage, DocumentationSection, PreviewControls, ControlField, PreviewStage, CodeBlock, PropsTable, AstroPreviewStatus, useAstroPreviews, componentExample, type Framework } from './ComponentDocumentation';
import astroPreviewsUrl from 'virtual:tkw-astro-brands';
import { createAstroPreviewLoader } from './astro-preview-loader';

function VueSample({ size }: { size: LogoSize }) {
  const host = useRef<HTMLSpanElement>(null);
  const [props] = useState(() => shallowRef({ size }));
  useEffect(() => { props.value = { size }; }, [props, size]);
  useEffect(() => {
    const app = createApp({ render: () => h(VueTBrand, props.value) });
    app.mount(host.current!);
    return () => app.unmount();
  }, [props]);
  return <span ref={host} className="tkw-doc-sample-host" />;
}

const loadAstro = createAstroPreviewLoader<AstroBrandPreviews>(astroPreviewsUrl);

function Sample({ framework, previews, size }: { framework: Framework; previews: AstroBrandPreviews | null; size: LogoSize }) {
  if (framework === 'react') return <ReactTBrand size={size} />;
  if (framework === 'vue') return <VueSample size={size} />;
  return <span className="tkw-doc-sample-host" dangerouslySetInnerHTML={{ __html: previews?.[size] ?? '' }} />;
}

export function TBrandDocumentation() {
  const [framework, setFramework] = useState<Framework>('react');
  const [size, setSize] = useState<LogoSize>(32);
  const { previews, error, retry } = useAstroPreviews(framework, loadAstro);
  const tag = framework === 'vue' ? `<TBrand :size="${size}" />` : `<TBrand size={${size}} />`;
  const code = (body: string) => componentExample(framework, 'TBrand', body, ['neutrals']);
  const homeCode = code(`<a href="/" aria-label="Tokiwagi UI ホーム">\n  ${tag}\n</a>`);
  const sample = (value: LogoSize) => <Sample framework={framework} previews={previews} size={value} />;

  return <DocumentationPage name="TBrand" framework={framework} onFrameworkChange={setFramework}
    description="ロゴと名称「Tokiwagi UI」をセットで表示する、静的なブランド表示です。">
    <DocumentationSection name="preview">
      <p>フレームワークを切り替えると、実際のコンポーネントと使用コードが切り替わります。選択したサイズは維持します。</p>
      <AstroPreviewStatus framework={framework} ready={previews !== null} error={error} retry={retry} />
      <PreviewControls>
        <ControlField label="サイズ"><select value={size} onChange={event => setSize(Number(event.target.value) as LogoSize)}>
          {logoSizes.map(value => <option key={value} value={value}>{value}px</option>)}
        </select></ControlField>
      </PreviewControls>
      <PreviewStage label="選択したTBrandの見本">{sample(size)}</PreviewStage>
      <p className="tkw-doc-note">図形 {size}×{size}px · TLogoの四辺の余白 {size / 4}px · ロゴ領域 {size * 1.5}×{size * 1.5}px。名称は16pxで固定です。</p>
      <CodeBlock code={code(tag)} />
      <details className="tkw-doc-comparisons">
        <summary>サイズを比較</summary>
        <h3>3サイズ</h3>
        <div className="tkw-doc-size-grid">{logoSizes.map(value => <figure key={value}>
          <PreviewStage label={`${value}pxのTBrandの見本`}>{sample(value)}</PreviewStage>
          <figcaption>図形 {value}px / ロゴ領域 {value * 1.5}px</figcaption>
        </figure>)}</div>
      </details>
    </DocumentationSection>
    <DocumentationSection name="basic">
      <p>neutrals.cssをアプリ全体で一度読み込みます。ホームリンクは親のa要素で構成し、aria-labelを「Tokiwagi UI ホーム」にします。</p>
      <CodeBlock code={homeCode} />
    </DocumentationSection>
    <DocumentationSection name="api">
      <PropsTable rows={[
        { name: 'size', description: <><code>32 | 64 | 128</code> · ロゴの図形幅。非対応値は描画時に拒否。</>, defaultValue: '32' },
        { name: framework === 'react' ? 'className' : 'class', description: framework === 'vue' ? '文字列・配列・オブジェクト · 外側のspanに付与する配置用クラス。' : 'string · 外側のspanに付与する配置用クラス。', defaultValue: 'なし' },
      ]} />
      <p>名称・配色・配置は固定です。追加属性・イベント・children／slot・refは内部DOMへ転送しません。classで内部の寸法や余白を上書きしないでください。</p>
    </DocumentationSection>
    <DocumentationSection name="rules">
      <p>TLogoの余白は維持し、外側にはpaddingを追加しません。全幅は「図形幅×1.5＋8px＋名称の実測幅」、高さは図形幅×1.5です。名称の右側の余白やリンクの操作領域は親で確保してください。</p>
      <p>書体は既存のInter・Noto Sans JP・システムフォント、名称は16px・太さ600・行高1.5、間隔は8pxです。フォントの配信は利用側が担当します。小さい画面でもロゴと名称を縮小・折り返しません。大きい見本は必要に応じて横スクロールできます。</p>
      <p>neutrals.cssを読み込み、TLogoの白背景を確保してください。ロゴの固定配色は変えません。</p>
    </DocumentationSection>
    <DocumentationSection name="accessibility">
      <p>内部TLogoはdecorativeで空altです。名称を通常のテキストで一度だけ伝えます。静的表示にフォーカスはありません。</p>
      <PreviewStage label="TBrandを使った親のホームリンクの見本">
        <a className="tkw-doc-example-link" href="/" target="_top" aria-label="Tokiwagi UI ホーム">{sample(size)}</a>
      </PreviewStage>
      <p>リンク先・操作名・ホバー・押下・フォーカスは親のa要素が担当します。</p>
    </DocumentationSection>
    <DocumentationSection name="advanced">
      <details><summary>導入・応用（CSP・SSR）</summary>
        <p>SVG原本はdata URLで埋め込むため、CSPのimg-srcにdata:を許可します。React・VueはSSRとハイドレーションに対応し、Astroは静的HTMLを出力します。</p>
      </details>
    </DocumentationSection>
    <DocumentationSection name="related">
      <div className="tkw-doc-related">
        <a href="./?path=/docs/components-tlogo--docs" target="_top">TLogo：ロゴ単体</a>
        <a href="./?path=/docs/brand-logo--docs" target="_top">ロゴの使用ルール・原本ダウンロード</a>
        <a href="./?path=/docs/components-documentation-rules--docs" target="_top">ドキュメントUIルール</a>
      </div>
    </DocumentationSection>
  </DocumentationPage>;
}
