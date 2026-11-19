import type { ComponentPropsWithoutRef } from 'react';
import { linkState, type LinkOptions } from '../lib/link';
import { TIcon } from './TIcon';

export type TLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & LinkOptions;

export function TLink({ href, tone, leadingIcon, trailingIcon, target, rel, className, children, ...attributes }: TLinkProps) {
  const state = linkState({ href, tone, leadingIcon, trailingIcon, target, rel, 'aria-current': attributes['aria-current'] });
  return <a {...attributes} href={state.href} target={target} rel={state.rel}
    className={['tkw-link', className].filter(Boolean).join(' ')} data-tone={state.tone} data-current={state.isCurrent || undefined}>
    {state.leadingIcon !== undefined && <span className="tkw-link__leading-icon"><TIcon name={state.leadingIcon} size={16} /></span>}
    <span className="tkw-link__label">{children}</span>
    {state.trailingIcon !== undefined && <span className="tkw-link__trailing-icon"><TIcon name={state.trailingIcon} size={16} /></span>}
  </a>;
}
