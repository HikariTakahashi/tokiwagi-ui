import { linkButtonSizeState } from '../lib/link-size';
import type { ComponentPropsWithoutRef } from 'react';
import { linkState, type LinkButtonOptions } from '../lib/link';
import { TIcon } from './TIcon';

export type TLinkButtonProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & LinkButtonOptions;

export function TLinkButton({ href, tone, size, leadingIcon, trailingIcon, target, rel, className, children, ...attributes }: TLinkButtonProps) {
  const sizing = linkButtonSizeState(size);
  const state = linkState({ href, tone, leadingIcon, trailingIcon, target, rel, 'aria-current': attributes['aria-current'] }, 'TLinkButton');
  return <a {...attributes} href={state.href} target={target} rel={state.rel}
    className={['tkw-button', 'tkw-link-button', className].filter(Boolean).join(' ')} data-size={sizing.size} data-tone={state.tone} data-current={state.isCurrent || undefined}>
    {state.leadingIcon !== undefined && <span className="tkw-button__icon tkw-link-button__leading-icon"><TIcon name={state.leadingIcon} size={sizing.iconSize} /></span>}
    <span className="tkw-button__label tkw-link-button__label">{children}</span>
    {state.trailingIcon !== undefined && <span className="tkw-button__icon tkw-link-button__trailing-icon"><TIcon name={state.trailingIcon} size={sizing.iconSize} /></span>}
  </a>;
}
