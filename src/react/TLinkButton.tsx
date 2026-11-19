import { linkButtonSizeState } from '../lib/link-size';
import type { ComponentPropsWithoutRef } from 'react';
import type { LinkButtonOptions } from '../lib/link';
import { linkButtonState, linkButtonAttributes, stopDisabledLinkActivation } from '../lib/link-button';
import { TIcon } from './TIcon';

export type TLinkButtonProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & LinkButtonOptions;

export function TLinkButton({ href, tone, size, weight, leadingIcon, trailingIcon, disabled, target, rel, className, children, ...attributes }: TLinkButtonProps) {
  const sizing = linkButtonSizeState(size);
  const state = linkButtonState({ href, tone, weight, leadingIcon, trailingIcon, disabled, target, rel, 'aria-current': attributes['aria-current'] });
  const forwarded = linkButtonAttributes(attributes, state.disabled);
  return <a {...forwarded} href={state.disabled ? undefined : state.href} target={state.disabled ? undefined : target} rel={state.disabled ? undefined : state.rel}
    role={state.disabled ? 'link' : attributes.role} aria-disabled={state.disabled ? true : attributes['aria-disabled']}
    onClick={state.disabled ? stopDisabledLinkActivation : forwarded.onClick}
    onDoubleClick={state.disabled ? stopDisabledLinkActivation : forwarded.onDoubleClick}
    onAuxClick={state.disabled ? stopDisabledLinkActivation : forwarded.onAuxClick}
    onKeyDown={state.disabled ? stopDisabledLinkActivation : forwarded.onKeyDown}
    onKeyUp={state.disabled ? stopDisabledLinkActivation : forwarded.onKeyUp}
    className={['tkw-button', 'tkw-link-button', className].filter(Boolean).join(' ')} data-size={sizing.size} data-tone={state.tone} data-weight={state.weight} data-current={state.isCurrent || undefined} data-disabled={state.disabled || undefined}>
    {state.leadingIcon !== undefined && <span className="tkw-button__icon tkw-link-button__leading-icon"><TIcon name={state.leadingIcon} size={sizing.iconSize} /></span>}
    <span className="tkw-button__label tkw-link-button__label">{children}</span>
    {state.trailingIcon !== undefined && <span className="tkw-button__icon tkw-link-button__trailing-icon"><TIcon name={state.trailingIcon} size={sizing.iconSize} /></span>}
  </a>;
}
