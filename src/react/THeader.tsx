import type { ComponentPropsWithoutRef } from 'react';
import { headerBackgroundState, type HeaderBackgroundColor } from '../lib/header-background';

export type THeaderProps = ComponentPropsWithoutRef<'header'> & { scrollLabel?: string; backgroundColor?: HeaderBackgroundColor };

export function THeader({ children, scrollLabel = 'ヘッダー操作', className, backgroundColor, style, ...attributes }: THeaderProps) {
  const background = headerBackgroundState(backgroundColor);
  return <header {...attributes} data-background={background.backgroundColor} style={{ ...background.style, ...style }} className={['tkw-header', className].filter(Boolean).join(' ')}>
    <div className="tkw-header__scroll" role="region" aria-label={scrollLabel} tabIndex={0}>
      <div className="tkw-header__content">{children}</div>
    </div>
  </header>;
}
