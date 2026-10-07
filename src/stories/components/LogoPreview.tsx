import type { CSSProperties } from 'react';
import logoUrl from '../../../icons/logo/logo.svg?url';
import './logo-preview.css';

function logoStyle(size: number): CSSProperties {
  return { '--tkw-logo-size': `${size}px` } as CSSProperties;
}

/** Storybook専用の見本。原本を画像として表示し、形状と固定配色を保持する。 */
export function LogoPreview() {
  return <section className="tkw-logo-preview" aria-label="ロゴの見本">
    <div className="tkw-logo-preview-header">
      <div className="tkw-logo-lockup">
        <span className="tkw-logo-clearspace" style={logoStyle(64)}><img src={logoUrl} width={64} height={64} alt="" /></span>
        <strong>Tokiwagi UI</strong>
      </div>
      <a className="tkw-logo-download" href="./icon-assets/logo/logo.svg" download="logo.svg">原本SVGをダウンロード</a>
    </div>
    <div className="tkw-logo-sizes">
      {[32, 64, 128].map(size => <figure key={size}>
        <div className={`tkw-logo-swatch${size === 64 ? ' tkw-logo-swatch-subtle' : ''}`}>
          <span className="tkw-logo-clearspace" style={logoStyle(size)}><img src={logoUrl} width={size} height={size} alt="" /></span>
        </div>
        <figcaption>{size}px{size === 32 ? ' / 最小サイズ' : ''} · {size === 64 ? '淡い背景' : '白い背景'}</figcaption>
      </figure>)}
    </div>
    <div className="tkw-logo-link-example">
      <p>名称を併記したホームリンク</p>
      <a className="tkw-logo-home" href="http://localhost:4321/" target="_blank" rel="noopener noreferrer" aria-label="Tokiwagi UI ホーム（新しいタブで開く）">
        <span className="tkw-logo-clearspace" style={logoStyle(32)}><img src={logoUrl} width={32} height={32} alt="" /></span>
        <span>Tokiwagi UI</span><span aria-hidden="true">↗</span>
      </a>
    </div>
  </section>;
}
