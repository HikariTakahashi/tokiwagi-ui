import type { ComponentPropsWithoutRef } from 'react';
import { headerButtonState, type HeaderButtonOptions } from '../lib/header';

export type THeaderButtonProps = ComponentPropsWithoutRef<'button'> & HeaderButtonOptions;

export function THeaderButton({ tone, iconOnly, selected, disabled, type, className, children, ...attributes }: THeaderButtonProps) {
  const state = headerButtonState({ tone, iconOnly, selected, disabled, type });
  return <button {...attributes} type={state.type} disabled={state.disabled}
    className={['tkw-header-button', className].filter(Boolean).join(' ')} data-tone={state.tone}
    data-icon-only={state.iconOnly || undefined} data-selected={state.selected || undefined}
    aria-pressed={state.selected ?? attributes['aria-pressed']}>
    {children}
  </button>;
}
