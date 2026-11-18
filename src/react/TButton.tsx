import type { ComponentPropsWithoutRef } from 'react';
import { buttonState, type ButtonOptions } from '../lib/button';
import { TIcon } from './TIcon';

export type TButtonProps = ComponentPropsWithoutRef<'button'> & ButtonOptions;

export function TButton({
  tone, leadingIcon, type, disabled, className, children, ...attributes
}: TButtonProps) {
  const state = buttonState({ tone, leadingIcon, type, disabled });
  return (
    <button {...attributes} className={['tkw-button', className].filter(Boolean).join(' ')}
      type={state.type} disabled={state.disabled} data-tone={state.tone}>
      {state.leadingIcon !== undefined && (
        <span className="tkw-button__icon"><TIcon name={state.leadingIcon} size={32} /></span>
      )}
      <span className="tkw-button__label">{children}</span>
    </button>
  );
}
