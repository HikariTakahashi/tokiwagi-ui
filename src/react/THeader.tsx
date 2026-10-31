import type { ComponentPropsWithoutRef } from 'react';

export type THeaderProps = ComponentPropsWithoutRef<'header'> & { scrollLabel?: string };

export function THeader({ children, scrollLabel = 'ヘッダー操作', className, ...attributes }: THeaderProps) {
  return <header {...attributes} className={['tkw-header', className].filter(Boolean).join(' ')}>
    <div className="tkw-header__scroll" role="region" aria-label={scrollLabel} tabIndex={0}>
      <div className="tkw-header__content">{children}</div>
    </div>
  </header>;
}
