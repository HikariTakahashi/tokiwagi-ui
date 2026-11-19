import type { CardDataAttributes } from '../lib/card';
import type { ComponentPropsWithoutRef } from 'react';

export type TCardHeaderProps = ComponentPropsWithoutRef<'div'> & CardDataAttributes;
export function TCardHeader({ className, children, ...attributes }: TCardHeaderProps) {
  return <div {...attributes} className={['tkw-card-header', className].filter(Boolean).join(' ')}>{children}</div>;
}
