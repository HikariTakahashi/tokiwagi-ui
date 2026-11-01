import type { ComponentPropsWithoutRef } from 'react';
import { headerLinkState, type HeaderLinkOptions } from '../lib/header-link';

export type THeaderLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & HeaderLinkOptions;

export function THeaderLink({ href, tone, iconOnly, target, rel, className, children, ...attributes }: THeaderLinkProps) {
  const state = headerLinkState({ href, tone, iconOnly, target, rel, 'aria-current': attributes['aria-current'] });
  return <a {...attributes} href={state.href} target={target} rel={state.rel}
    className={['tkw-header-button', 'tkw-header-link', className].filter(Boolean).join(' ')}
    data-tone={state.tone} data-icon-only={state.iconOnly || undefined} data-selected={state.selected || undefined}>
    {children}
  </a>;
}
