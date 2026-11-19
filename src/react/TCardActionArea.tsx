import type { CardDataAttributes } from '../lib/card';
import type { ComponentPropsWithoutRef } from 'react';
import { cardActionAreaState, type CardActionAreaOptions } from '../lib/card';

export type TCardActionAreaProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & CardActionAreaOptions & CardDataAttributes;
export function TCardActionArea({ href, target, rel, className, children, ...attributes }: TCardActionAreaProps) {
  const state = cardActionAreaState({ href, target, rel });
  return <a {...attributes} href={state.href} target={target} rel={state.rel}
    className={['tkw-card-action-area', className].filter(Boolean).join(' ')}>{children}</a>;
}
