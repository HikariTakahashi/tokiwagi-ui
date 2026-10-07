import type { ReactElement } from 'react';
import { logoPresentation, type LogoOptions } from '../lib/logo';

export type { LogoSize } from '../lib/logo';
export type TLogoProps = LogoOptions & { className?: string };

/** 固定配色のブランドロゴ。名称併記時はdecorativeを指定し、リンクは親が担う。 */
export function TLogo({ size = 32, decorative = false, className }: TLogoProps): ReactElement {
  const logo = logoPresentation(size, decorative);
  return <span className={className} style={logo.frameStyle}>
    <img src={logo.src} alt={logo.alt} width={size} height={size} style={logo.imageStyle} draggable={false} />
  </span>;
}
