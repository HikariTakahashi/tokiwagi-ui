import type { ReactElement } from 'react';
import type { LogoSize } from '../lib/logo';
import { brandName, brandStyle, brandNameStyle } from '../lib/brand';
import { TLogo } from './TLogo';

export type TBrandProps = { size?: LogoSize; className?: string };

/** ロゴと固定名称の静的表示。追加属性・イベント・childrenは転送しない。 */
export function TBrand({ size = 32, className }: TBrandProps): ReactElement {
  return <span className={className} style={brandStyle}>
    <TLogo size={size} decorative />
    <span style={brandNameStyle}>{brandName}</span>
  </span>;
}
