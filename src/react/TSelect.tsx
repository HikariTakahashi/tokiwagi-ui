import { useId, type ComponentPropsWithoutRef } from 'react';
import { selectDescribedBy, selectState, selectValue, type SelectOptions } from '../lib/select';
import { TIcon } from './TIcon';

export type TSelectProps = Omit<ComponentPropsWithoutRef<'select'>, 'children' | 'multiple' | 'size' | 'value' | 'defaultValue'> & SelectOptions & {
  value?: string;
  defaultValue?: string;
  children?: never;
  multiple?: never;
};

export function TSelect({ options, placeholder, label, description, error, tone, size, value, defaultValue,
  id, className, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...attributes }: TSelectProps) {
  const generated = useId();
  const inputId = id ?? `tkw-select-${generated}`;
  const state = selectState({ options, placeholder, label, description, error, tone, size });
  return <span className="tkw-select-field">
    {label && <label className="tkw-select-field__label" htmlFor={inputId}>{label}{attributes.required && <span className="tkw-select-field__required">必須</span>}</label>}
    <span className="tkw-select">
      <select {...attributes} id={inputId} className={['tkw-select__input', className].filter(Boolean).join(' ')}
        value={selectValue(value)} defaultValue={selectValue(defaultValue)} multiple={false}
        data-tone={state.tone} data-size={state.size} aria-invalid={error ? true : invalid}
        aria-describedby={selectDescribedBy(inputId, description, error, describedBy)}>
        {state.options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
      <span className="tkw-select__arrow" aria-hidden="true"><TIcon name="chevron-bottom" size={16} /></span>
    </span>
    {description && <span className="tkw-select-field__description" id={`${inputId}-description`}>{description}</span>}
    {error && <span className="tkw-select-field__error" id={`${inputId}-error`}>エラー：{error}</span>}
  </span>;
}
