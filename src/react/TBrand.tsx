import type { ReactElement } from 'react';
import type { LogoSize } from '../lib/logo';
import { resolveBrandText, brandStyle, brandNameStyle } from '../lib/brand';
import { TLogo } from './TLogo';

export type TBrandProps = { text?: string; size?: LogoSize; className?: string };

/** ロゴと指定テキストの静的表示。追加属性・イベント・childrenは転送しない。 */
export function TBrand({ text, size = 32, className }: TBrandProps): ReactElement {
  return <span className={className} style={brandStyle}>
    <TLogo size={size} decorative />
    <span style={brandNameStyle}>{resolveBrandText(text)}</span>
  </span>;
}
