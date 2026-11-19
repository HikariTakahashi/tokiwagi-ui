import type { CardDataAttributes } from '../lib/card';
import type { ComponentPropsWithoutRef } from 'react';

export type TCardMediaProps = ComponentPropsWithoutRef<'div'> & CardDataAttributes;
export function TCardMedia({ className, children, ...attributes }: TCardMediaProps) {
  return <div {...attributes} className={['tkw-card-media', className].filter(Boolean).join(' ')}>{children}</div>;
}
