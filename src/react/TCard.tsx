import type { CardDataAttributes } from '../lib/card';
import type { HTMLAttributes } from 'react';
import { cardState, type CardOptions } from '../lib/card';

export type TCardProps = HTMLAttributes<HTMLElement> & CardOptions & CardDataAttributes;
export function TCard({ as, variant, size, className, children, ...attributes }: TCardProps) {
  const { tag: Tag, attributes: state } = cardState({ as, variant, size });
  return <Tag {...attributes} {...state} className={['tkw-card', className].filter(Boolean).join(' ')}>{children}</Tag>;
}
