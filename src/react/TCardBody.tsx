import type { CardDataAttributes } from '../lib/card';
import type { ComponentPropsWithoutRef } from 'react';

export type TCardBodyProps = ComponentPropsWithoutRef<'div'> & CardDataAttributes;
export function TCardBody({ className, children, ...attributes }: TCardBodyProps) {
  return <div {...attributes} className={['tkw-card-body', className].filter(Boolean).join(' ')}>{children}</div>;
}
