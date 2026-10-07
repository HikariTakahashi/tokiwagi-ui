import { TLogo } from 'tokiwagi-ui/react';
import './logo-preview.css';

/** 公開入口のTLogoを使い、使用ルールの見本も実コンポーネントと揃える。 */
export function LogoPreview() {
  return <section className="tkw-logo-preview" aria-label="ロゴの見本">
    <div className="tkw-logo-preview-header">
      <div className="tkw-logo-lockup">
        <TLogo size={64} decorative />
        <strong>Tokiwagi UI</strong>
      </div>
      <a className="tkw-logo-download" href="./icon-assets/logo/logo.svg" download="logo.svg">原本SVGをダウンロード</a>
    </div>
    <div className="tkw-logo-sizes">
      {([32, 64, 128] as const).map(size => <figure key={size}>
        <div className={`tkw-logo-swatch${size === 64 ? ' tkw-logo-swatch-subtle' : ''}`}>
          <TLogo size={size} decorative />
        </div>
        <figcaption>{size}px{size === 32 ? ' / 最小サイズ' : ''} · {size === 64 ? '淡い背景' : '白い背景'}</figcaption>
      </figure>)}
    </div>
    <div className="tkw-logo-link-example">
      <p>名称を併記したホームリンク</p>
      <a className="tkw-logo-home" href="http://localhost:4321/" target="_blank" rel="noopener noreferrer" aria-label="Tokiwagi UI ホーム（新しいタブで開く）">
        <TLogo decorative />
        <span>Tokiwagi UI</span><span aria-hidden="true">↗</span>
      </a>
    </div>
  </section>;
}
