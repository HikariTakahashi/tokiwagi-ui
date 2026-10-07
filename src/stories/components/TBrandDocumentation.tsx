import { useEffect, useRef, useState } from 'react';
import { createApp, h, shallowRef } from 'vue';
import { TBrand as ReactTBrand, type LogoSize } from 'tokiwagi-ui/react';
import { TBrand as VueTBrand } from 'tokiwagi-ui/vue';
import { logoSizes } from '../../lib/logo';
import type { AstroBrandPreviews } from '../astro-brand-previews';
import './tbrand-documentation.css';

type Framework = 'react' | 'vue' | 'astro';

function VueSample({ size }: { size: LogoSize }) {
  const host = useRef<HTMLSpanElement>(null);
  const [props] = useState(() => shallowRef({ size }));
  useEffect(() => { props.value = { size }; }, [props, size]);
  useEffect(() => {
    const app = createApp({ render: () => h(VueTBrand, props.value) });
    app.mount(host.current!);
    return () => app.unmount();
  }, [props]);
  return <span ref={host} />;
}

let astroPromise: Promise<AstroBrandPreviews> | undefined;
function loadAstro() {
  return astroPromise ??= import('virtual:tkw-astro-brands').then(module => module.default).catch(error => {
    astroPromise = undefined;
    throw error;
  });
}

function Sample({ framework, previews, size }: { framework: Framework; previews: AstroBrandPreviews | null; size: LogoSize }) {
  if (framework === 'react') return <ReactTBrand size={size} />;
  if (framework === 'vue') return <VueSample size={size} />;
  return <span dangerouslySetInnerHTML={{ __html: previews?.[size] ?? '' }} />;
}

export function TBrandDocumentation() {
  const [framework, setFramework] = useState<Framework>('react');
  const [size, setSize] = useState<LogoSize>(32);
  const [previews, setPreviews] = useState<AstroBrandPreviews | null>(null);
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
  const tag = framework === 'vue' ? `<TBrand :size="${size}" />` : `<TBrand size={${size}} />`;
  const code = `${framework === 'astro' ? '---\n' : ''}import { TBrand } from 'tokiwagi-ui/${framework}';\nimport 'tokiwagi-ui/tokens/neutrals.css';\n${framework === 'astro' ? '---\n' : ''}${tag}\n<a href="/" aria-label="Tokiwagi UI ホーム">\n  ${tag}\n</a>`;
  const sample = (value: LogoSize) => <Sample framework={framework} previews={previews} size={value} />;

  return <article className="tkw-tbrand-doc sb-unstyled" aria-labelledby="tbrand-heading">
    <h1 id="tbrand-heading">TBrand</h1>
    <p>ロゴと名称「Tokiwagi UI」をセットで表示する、静的なブランド表示です。</p>
    <div className="tkw-tbrand-frameworks" role="group" aria-label="フレームワーク">
      {(['react', 'vue', 'astro'] as const).map(value =>
        <button type="button" key={value} aria-pressed={framework === value} onClick={() => setFramework(value)}>{value === 'react' ? 'React' : value === 'vue' ? 'Vue' : 'Astro'}</button>
      )}
    </div>
    <label className="tkw-tbrand-control">ロゴの図形幅<select value={size} onChange={event => setSize(Number(event.target.value) as LogoSize)}>
      {logoSizes.map(value => <option key={value} value={value}>{value}px</option>)}
    </select></label>
    {framework === 'astro' && !previews && (error
      ? <p role="alert">{error} <button type="button" onClick={() => setRetry(value => value + 1)}>再試行</button></p>
      : <p role="status">Astroの見本を読み込み中…</p>)}
    <h2>静的表示</h2>
    <div className="tkw-tbrand-stage" aria-label="選択したTBrandの見本">{sample(size)}</div>
    <p>図形 {size}×{size}px · TLogoの四辺の余白 {size / 4}px · ロゴ領域 {size * 1.5}×{size * 1.5}px。名称は16pxで固定です。</p>
    <h2>サイズ別</h2>
    <div className="tkw-tbrand-sizes">{logoSizes.map(value =>
      <figure key={value}><div className="tkw-tbrand-stage">{sample(value)}</div><figcaption>図形 {value}px / ロゴ領域 {value * 1.5}px</figcaption></figure>
    )}</div>
    <h2>親のホームリンク</h2>
    <div className="tkw-tbrand-home-stage"><a className="tkw-tbrand-home" href="/" target="_top" aria-label="Tokiwagi UI ホーム">{sample(size)}</a></div>
    <p>リンク先・操作名・ホバー・押下・フォーカスは親のa要素が担当します。ロゴの固定配色は変えません。</p>
    <pre aria-label="使用コード"><code>{code}</code></pre>
    <h2>公開APIと占有領域</h2>
    <div className="tkw-tbrand-table"><table><thead><tr><th>props</th><th>既定値</th><th>用途</th></tr></thead><tbody>
      <tr><td>size</td><td>32</td><td>ロゴの図形幅。32・64・128px。非対応値は描画時に拒否。</td></tr>
      <tr><td>{framework === 'react' ? 'className' : 'class'}</td><td>なし</td><td>外側のspanに付与する配置用クラス。</td></tr>
    </tbody></table></div>
    <p>名称・配色・配置は固定です。追加属性・イベント・children／slot・refは内部DOMへ転送しません。静的表示にフォーカスはありません。classで内部の寸法や余白を上書きしないでください。</p>
    <p>内部TLogoはdecorativeで空altです。名称を通常のテキストで一度だけ伝えます。TLogoの余白は維持し、外側にはpaddingを追加しません。全幅は「図形幅×1.5＋8px＋名称の実測幅」、高さは図形幅×1.5です。名称の右側の余白やリンクの操作領域は親で確保してください。</p>
    <p>書体は既存のInter・Noto Sans JP・システムフォント、名称は16px・太さ600・行高1.5、間隔は8pxです。フォントの配信は利用側が担当します。小さい画面でもロゴと名称を縮小・折り返しません。大きい見本は必要に応じて横スクロールできます。</p>
    <p>neutrals.cssを読み込み、TLogoの白背景を確保してください。SVG原本はdata URLで埋め込むため、CSPのimg-srcにdata:を許可します。React・VueはSSRとハイドレーションに対応し、Astroは静的HTMLを出力します。</p>
  </article>;
}
