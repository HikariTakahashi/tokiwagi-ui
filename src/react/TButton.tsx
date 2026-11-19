import type { ComponentPropsWithoutRef } from 'react';
import { buttonState, type ButtonOptions } from '../lib/button';
import { TIcon } from './TIcon';

export type TButtonProps = ComponentPropsWithoutRef<'button'> & ButtonOptions;

export function TButton({
  tone, size, leadingIcon, trailingIcon, type, disabled, className, children, ...attributes
}: TButtonProps) {
  const state = buttonState({ tone, size, leadingIcon, trailingIcon, type, disabled });
  return (
    <button {...attributes} className={['tkw-button', className].filter(Boolean).join(' ')}
      type={state.type} disabled={state.disabled} data-tone={state.tone} data-size={state.size}>
      {state.leadingIcon !== undefined && (
        <span className="tkw-button__icon tkw-button__leading-icon"><TIcon name={state.leadingIcon} size={state.iconSize} /></span>
      )}
      <span className="tkw-button__label">{children}</span>
      {state.trailingIcon !== undefined && (
        <span className="tkw-button__icon tkw-button__trailing-icon"><TIcon name={state.trailingIcon} size={state.iconSize} /></span>
      )}
    </button>
  );
}
