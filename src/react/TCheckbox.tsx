import { useCallback, useId, type ComponentPropsWithoutRef } from 'react';
import { checkboxState, type CheckboxOptions } from '../lib/checkbox';

export type TCheckboxProps = Omit<ComponentPropsWithoutRef<'input'>,
  'children' | 'type' | 'defaultValue' | 'value' | 'role' | 'aria-checked'> & CheckboxOptions;

export function TCheckbox({
  label, description, error, tone, checked, defaultChecked, indeterminate, value,
  id, className, onChange, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...attributes
}: TCheckboxProps) {
  const generated = useId();
  const inputId = id ?? `tkw-checkbox-${generated}`;
  const state = checkboxState(inputId, { label, description, error, tone, defaultChecked, indeterminate, value }, checked, describedBy);
  const setInput = useCallback((input: HTMLInputElement | null) => {
    if (input) input.indeterminate = state.indeterminate;
  }, [state.indeterminate]);

  return <span className="tkw-checkbox-field">
    <label className="tkw-checkbox-field__label" htmlFor={inputId}>
      <span className="tkw-checkbox">
        <input {...attributes} ref={setInput} id={inputId} type="checkbox" value={value}
          className={['tkw-checkbox__input', className].filter(Boolean).join(' ')}
          checked={state.checked} defaultChecked={state.checked === undefined ? state.defaultChecked : undefined}
          role={undefined} aria-checked={undefined} aria-invalid={error ? true : invalid}
          aria-describedby={state.describedBy}
          data-tkw-checkbox-mixed={state.indeterminate || undefined}
          onChange={event => {
            // ブラウザーは操作時にmixedを解除する。次の表示は利用側のpropで決まる。
            event.currentTarget.indeterminate = state.indeterminate;
            onChange?.(event);
          }} />
        <span className="tkw-checkbox__box" data-tone={state.tone} aria-hidden="true" />
      </span>
      {label && <span className="tkw-checkbox-field__name">{label}</span>}
    </label>
    {description && <span className="tkw-checkbox-field__description" id={state.descriptionId}>{description}</span>}
    {error && <span className="tkw-checkbox-field__error" id={state.errorId}>エラー：{error}</span>}
  </span>;
}
