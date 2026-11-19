import type { CardDataAttributes } from '../lib/card';
import type { ComponentPropsWithoutRef } from 'react';

export type TCardDescriptionProps = ComponentPropsWithoutRef<'p'> & CardDataAttributes;
export function TCardDescription({ className, children, ...attributes }: TCardDescriptionProps) {
  return <p {...attributes} className={['tkw-card-description', className].filter(Boolean).join(' ')}>{children}</p>;
}
