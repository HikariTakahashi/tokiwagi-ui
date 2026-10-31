import type { ComponentPropsWithoutRef } from 'react';
import { resolveHeaderSectionPosition, type HeaderSectionPosition } from '../lib/header';

export type THeaderSectionProps = ComponentPropsWithoutRef<'div'> & { position: HeaderSectionPosition };

export function THeaderSection({ position, className, children, ...attributes }: THeaderSectionProps) {
  return <div {...attributes} className={['tkw-header-section', className].filter(Boolean).join(' ')}
    data-position={resolveHeaderSectionPosition(position)}>{children}</div>;
}
