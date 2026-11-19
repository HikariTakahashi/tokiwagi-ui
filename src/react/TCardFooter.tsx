import type { CardDataAttributes } from '../lib/card';
import type { ComponentPropsWithoutRef } from 'react';

export type TCardFooterProps = ComponentPropsWithoutRef<'div'> & CardDataAttributes;
export function TCardFooter({ className, children, ...attributes }: TCardFooterProps) {
  return <div {...attributes} className={['tkw-card-footer', className].filter(Boolean).join(' ')}>{children}</div>;
}
