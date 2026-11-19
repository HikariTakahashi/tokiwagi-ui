import type { CardDataAttributes } from '../lib/card';
import type { HTMLAttributes } from 'react';
import { cardTitleTag, type CardTitleOptions } from '../lib/card';

export type TCardTitleProps = HTMLAttributes<HTMLHeadingElement> & CardTitleOptions & CardDataAttributes;
export function TCardTitle({ as, className, children, ...attributes }: TCardTitleProps) {
  const Tag = cardTitleTag(as);
  return <Tag {...attributes} className={['tkw-card-title', className].filter(Boolean).join(' ')}>{children}</Tag>;
}
