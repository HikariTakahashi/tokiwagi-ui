import { useEffect, useRef, useState } from 'react';
import { createApp, h, shallowRef } from 'vue';
import { TLogo as ReactTLogo, type LogoSize } from 'tokiwagi-ui/react';
import { TLogo as VueTLogo } from 'tokiwagi-ui/vue';
import { logoSizes } from '../../lib/logo';
import type { AstroLogoPreviews } from '../astro-logo-previews';
import './tlogo-documentation.css';

type Framework = 'react' | 'vue' | 'astro';
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
  return <span ref={host} />;
}

let astroPromise: Promise<AstroLogoPreviews> | undefined;
function loadAstro() {
  return astroPromise ??= import('virtual:tkw-astro-logos').then(module => module.default).catch(error => {
    astroPromise = undefined;
    throw error;
  });
}

function Sample({ framework, previews, ...props }: SampleProps & { framework: Framework; previews: AstroLogoPreviews | null }) {
  if (framework === 'react') return <ReactTLogo {...props} />;
  if (framework === 'vue') return <VueSample {...props} />;
  return <span dangerouslySetInnerHTML={{ __html: previews?.[props.size][props.decorative ? 'decorative' : 'standalone'] ?? '' }} />;
}

export function TLogoDocumentation() {
  const [framework, setFramework] = useState<Framework>('react');
  const [size, setSize] = useState<LogoSize>(64);
  const [decorative, setDecorative] = useState(false);
  const [previews, setPreviews] = useState<AstroLogoPreviews | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (framework !== 'astro' || previews) return;
    let active = true;
    setError('');
    loadAstro().then(value => { if (active) setPreviews(value); }).catch(() => {
      if (active) setError('Astroの見本を読み込めませんでした。');
    });
    return () => { active = false; };
  }, [framework, previews, retry]);
  const tag = framework === 'vue'
    ? `<TLogo :size="${size}"${decorative ? ' decorative' : ''} />`
    : `<TLogo size={${size}}${decorative ? ' decorative' : ''} />`;
  const code = `${framework === 'astro' ? '---\n' : ''}import { TLogo } from 'tokiwagi-ui/${framework}';\nimport 'tokiwagi-ui/tokens/neutrals.css';\n${framework === 'astro' ? '---\n' : ''}${tag}`;
  const sample = (sampleSize: LogoSize, isDecorative = decorative) =>
    <Sample framework={framework} previews={previews} size={sampleSize} decorative={isDecorative} />;

  return <article className="tkw-tlogo-doc sb-unstyled" aria-labelledby="tlogo-heading">
    <h1 id="tlogo-heading">TLogo</h1>
    <p>Tokiwagi UIのブランドロゴ。原本の固定配色と、四辺の余白を保って表示します。</p>
    <div className="tkw-tlogo-frameworks" role="group" aria-label="フレームワーク">
      {(['react', 'vue', 'astro'] as const).map(value =>
        <button type="button" key={value} aria-pressed={framework === value} onClick={() => setFramework(value)}>{value === 'react' ? 'React' : value === 'vue' ? 'Vue' : 'Astro'}</button>
      )}
    </div>
    <div className="tkw-tlogo-controls">
      <label>サイズ<select value={size} onChange={event => setSize(Number(event.target.value) as LogoSize)}>
        {logoSizes.map(value => <option key={value} value={value}>{value}px</option>)}
      </select></label>
      <label><input type="checkbox" checked={decorative} onChange={event => setDecorative(event.target.checked)} />装飾として表示（decorative）</label>
    </div>
    {framework === 'astro' && !previews && (error
      ? <p role="alert">{error} <button type="button" onClick={() => setRetry(value => value + 1)}>再試行</button></p>
      : <p role="status">Astroの見本を読み込み中…</p>)}
    <div className="tkw-tlogo-stage" aria-label="選択したTLogoの見本">{sample(size)}</div>
    <p className="tkw-tlogo-note">図形 {size}×{size}px · 四辺の余白 {size / 4}px · 占有領域 {size * 1.5}×{size * 1.5}px<br />
      {decorative ? '画像のaltは空です。名称やリンクの目的は親側で伝えてください。' : '画像のaltは「Tokiwagi UI」です。'}</p>
    <pre aria-label="使用コード"><code>{code}</code></pre>
    <h2>サイズと名称併記</h2>
    <div className="tkw-tlogo-sizes">{logoSizes.map(value =>
      <figure key={value}><div className="tkw-tlogo-stage">{sample(value)}</div><figcaption>{value}px / 余白込み {value * 1.5}px</figcaption></figure>
    )}</div>
    <a className="tkw-tlogo-brand-link" href="./?path=/docs/brand-logo--docs" target="_top" aria-label="Tokiwagi UI ロゴの使用ルール">
      {sample(32, true)}<span>Tokiwagi UI</span>
    </a>
    <p>このリンクではロゴを装飾として扱い、親のリンクに目的が分かる名前を付けています。</p>
    <h2>公開API</h2>
    <div className="tkw-tlogo-table"><table><thead><tr><th>props</th><th>既定値</th><th>用途</th></tr></thead><tbody>
      <tr><td>size</td><td>32</td><td>図形の幅。32・64・128px。余白は幅の1/4。</td></tr>
      <tr><td>decorative</td><td>false</td><td>trueでaltを空にする。名称併記・名前付きリンクで指定。</td></tr>
      <tr><td>{framework === 'react' ? 'className' : 'class'}</td><td>なし</td><td>外側のspanに付与する配置用クラス。</td></tr>
    </tbody></table></div>
    <p>配色・画像・寸法・余白はコンポーネントが管理します。追加属性・イベント・children／slotは転送しません。classで内部の表示ルールを上書きしないでください。</p>
    <h2>利用時の扱い</h2>
    <p>ライト背景用の部品です。neutrals.cssを読み込むと、余白部分に既存の白背景トークンを使います。画像はSVG原本をdata URLとして埋め込み、親の文字色を継承しません。CSPを設定する場合はimg-srcにdata:を許可してください。</p>
    <p>同じロゴを複数配置できます。画像内のIDを文書へ展開しないため、表示ごとのID設定は不要です。React・VueはSSRとハイドレーションに対応し、Astroは静的HTMLを出力します。</p>
    <p>ホームリンクは親のa要素で構成し、aria-labelを「Tokiwagi UI ホーム」にしてTLogoにdecorativeを指定します。名称は通常のテキストとして併記してください。</p>
  </article>;
}
