import { useEffect, useRef, useState } from 'react';
import { createApp, h, shallowRef } from 'vue';
import { TLogo as ReactTLogo, type LogoSize } from 'tokiwagi-ui/react';
import { TLogo as VueTLogo } from 'tokiwagi-ui/vue';
import { logoSizes } from '../../lib/logo';
import type { AstroLogoPreviews } from '../astro-logo-previews';
import { DocumentationPage, DocumentationSection, PreviewControls, ControlField, CheckboxField, PreviewStage, CodeBlock, PropsTable, AstroPreviewStatus, useAstroPreviews, componentExample, type Framework } from './ComponentDocumentation';

import astroPreviewsUrl from 'virtual:tkw-astro-logos';
import { createAstroPreviewLoader } from './astro-preview-loader';

type SampleProps = { size: LogoSize; decorative: boolean };

function VueSample({ size, decorative }: SampleProps) {
  const host = useRef<HTMLSpanElement>(null);
  const [props] = useState(() => shallowRef({ size, decorative }));
  useEffect(() => { props.value = { size, decorative }; }, [props, size, decorative]);
  useEffect(() => {
    const app = createApp({ render: () => h(VueTLogo, props.value) });
    app.mount(host.current!);
    return () => app.unmount();
  }, [props]);
  return <span ref={host} className="tkw-doc-sample-host" />;
}

const loadAstro = createAstroPreviewLoader<AstroLogoPreviews>(astroPreviewsUrl);

function Sample({ framework, previews, ...props }: SampleProps & { framework: Framework; previews: AstroLogoPreviews | null }) {
  if (framework === 'react') return <ReactTLogo {...props} />;
  if (framework === 'vue') return <VueSample {...props} />;
  return <span className="tkw-doc-sample-host" dangerouslySetInnerHTML={{ __html: previews?.[props.size][props.decorative ? 'decorative' : 'standalone'] ?? '' }} />;
}

export function TLogoDocumentation() {
  const [framework, setFramework] = useState<Framework>('react');
  const [size, setSize] = useState<LogoSize>(32);
  const [decorative, setDecorative] = useState(false);
  const { previews, error, retry } = useAstroPreviews(framework, loadAstro);
  const tag = (value: LogoSize, isDecorative = decorative) => framework === 'vue'
    ? `<TLogo :size="${value}"${isDecorative ? ' decorative' : ''} />`
    : `<TLogo size={${value}}${isDecorative ? ' decorative' : ''} />`;
  const code = (body: string) => componentExample(framework, 'TLogo', body, ['neutrals']);
  const homeCode = code(`<a href="/" aria-label="Tokiwagi UI ホーム">\n  ${tag(size, true)}\n  <span>Tokiwagi UI</span>\n</a>`);
  const sample = (value: LogoSize, isDecorative = decorative) =>
    <Sample framework={framework} previews={previews} size={value} decorative={isDecorative} />;

  return <DocumentationPage name="TLogo" framework={framework} onFrameworkChange={setFramework}
    description="Tokiwagi UIのブランドロゴ。原本の固定配色と、四辺の余白を保って表示します。">
    <DocumentationSection name="preview">
      <p>フレームワークを切り替えると、実際のコンポーネントと使用コードが切り替わります。選択したサイズ・装飾の設定は維持します。</p>
      <AstroPreviewStatus framework={framework} ready={previews !== null} error={error} retry={retry} />
      <PreviewControls>
        <ControlField label="サイズ"><select value={size} onChange={event => setSize(Number(event.target.value) as LogoSize)}>
          {logoSizes.map(value => <option key={value} value={value}>{value}px</option>)}
        </select></ControlField>
        <CheckboxField heading="読み上げ" label="装飾として表示（decorative）" checked={decorative} onChange={setDecorative} />
      </PreviewControls>
      <PreviewStage label="選択したTLogoの見本">{sample(size)}</PreviewStage>
      <p className="tkw-doc-note">図形 {size}×{size}px · 四辺の余白 {size / 4}px · 占有領域 {size * 1.5}×{size * 1.5}px<br />
        {decorative ? '画像のaltは空です。名称やリンクの目的は親側で伝えてください。' : '画像のaltは「Tokiwagi UI」です。'}</p>
      <CodeBlock code={code(tag(size))} />
      <details className="tkw-doc-comparisons">
        <summary>サイズを比較</summary>
        <h3>3サイズ</h3>
        <div className="tkw-doc-size-grid">{logoSizes.map(value => <figure key={value}>
          <PreviewStage label={`${value}pxのTLogoの見本`}>{sample(value)}</PreviewStage>
          <figcaption>{value}px / 余白込み {value * 1.5}px</figcaption>
        </figure>)}</div>
      </details>
    </DocumentationSection>
    <DocumentationSection name="basic">
      <p>neutrals.cssをアプリ全体で一度読み込みます。ホームリンクは親のa要素で構成し、aria-labelを「Tokiwagi UI ホーム」にしてTLogoにdecorativeを指定します。名称は通常のテキストとして併記してください。</p>
      <CodeBlock code={homeCode} />
    </DocumentationSection>
    <DocumentationSection name="api">
      <PropsTable rows={[
        { name: 'size', description: <><code>32 | 64 | 128</code> · 図形の幅。余白は幅の1/4。</>, defaultValue: '32' },
        { name: 'decorative', description: <><code>boolean</code> · trueでaltを空にする。名称併記・名前付きリンクで指定。</>, defaultValue: 'false' },
        { name: framework === 'react' ? 'className' : 'class', description: framework === 'vue' ? '文字列・配列・オブジェクト · 外側のspanに付与する配置用クラス。' : 'string · 外側のspanに付与する配置用クラス。', defaultValue: 'なし' },
      ]} />
      <p>配色・画像・寸法・余白はコンポーネントが管理します。追加属性・イベント・children／slotは転送しません。classで内部の表示ルールを上書きしないでください。</p>
    </DocumentationSection>
    <DocumentationSection name="rules">
      <p>ライト背景用の部品です。neutrals.cssを読み込むと、余白部分に既存の白背景トークンを使います。画像はSVG原本をdata URLとして埋め込み、親の文字色を継承しません。</p>
      <p>許可サイズは32・64・128pxです。図形の四辺に幅の1/4の余白を確保するため、占有領域は図形幅の1.5倍です。</p>
    </DocumentationSection>
    <DocumentationSection name="accessibility">
      <p>単独表示のaltは「Tokiwagi UI」です。名称併記や名前付きリンクではdecorativeを指定し、重複読み上げを避けます。操作領域・フォーカス・ホバー・押下は親が担います。</p>
      <PreviewStage label="名称を併記したTLogoのリンクの見本">
        <a className="tkw-doc-example-link" href="./?path=/docs/brand-logo--docs" target="_top" aria-label="Tokiwagi UI ロゴの使用ルール">
          {sample(32, true)}<span>Tokiwagi UI</span>
        </a>
      </PreviewStage>
      <p>このリンクではロゴを装飾として扱い、親のリンクに目的が分かる名前を付けています。</p>
    </DocumentationSection>
    <DocumentationSection name="advanced">
      <details><summary>導入・応用（CSP・SSR）</summary>
        <p>SVG原本はdata URLで埋め込むため、CSPのimg-srcにdata:を許可してください。</p>
        <p>同じロゴを複数配置できます。画像内のIDを文書へ展開しないため、表示ごとのID設定は不要です。React・VueはSSRとハイドレーションに対応し、Astroは静的HTMLを出力します。</p>
      </details>
    </DocumentationSection>
    <DocumentationSection name="related">
      <div className="tkw-doc-related">
        <a href="./?path=/docs/brand-logo--docs" target="_top">ロゴの使用ルール・原本ダウンロード</a>
        <a href="./?path=/docs/components-tbrand--docs" target="_top">TBrand：ロゴと名称のセット</a>
        <a href="./?path=/docs/components-documentation-rules--docs" target="_top">ドキュメントUIルール</a>
      </div>
    </DocumentationSection>
  </DocumentationPage>;
}
