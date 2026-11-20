import { useLayoutEffect, useMemo, useRef } from 'react';
import { checkboxState, type CheckboxTone } from '../../lib/checkbox';

export type CheckboxPreviewOptions = {
  component: 'TCheckbox';
  checked: boolean;
  indeterminate: boolean;
  label: string;
  description: string;
  error: string;
  tone: CheckboxTone;
  disabled: boolean;
  required: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

/** 実Astro出力を使い、Controlsの変更でも入力とフォーカスを保持する。 */
export function AstroCheckboxPreview({ html, options, id }: {
  html: string;
  options: CheckboxPreviewOptions;
  id: string;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const markup = useMemo(() => ({ __html: html }), [html]);
  useLayoutEffect(() => {
    const root = host.current!;
    const input = root.querySelector('input')!;
    const label = root.querySelector('label')!;
    const name = root.querySelector<HTMLElement>('.tkw-checkbox-field__name')!;
    const description = root.querySelector<HTMLElement>('.tkw-checkbox-field__description')!;
    const error = root.querySelector<HTMLElement>('.tkw-checkbox-field__error')!;
    const box = root.querySelector<HTMLElement>('.tkw-checkbox__box')!;
    const state = checkboxState(id, options, options.checked);
    input.id = label.htmlFor = id;
    input.checked = options.checked;
    input.indeterminate = options.indeterminate;
    input.disabled = options.disabled;
    input.required = options.required;
    input.removeAttribute('data-tkw-checkbox-mixed');
    box.dataset.tone = state.tone;
    name.textContent = options.label;
    name.hidden = !options.label;
    if (options.label) input.removeAttribute('aria-label');
    else input.setAttribute('aria-label', '見本');
    description.textContent = options.description;
    description.id = state.descriptionId ?? '';
    description.hidden = !options.description;
    error.textContent = options.error ? `エラー：${options.error}` : '';
    error.id = state.errorId ?? '';
    error.hidden = !options.error;
    if (state.describedBy) input.setAttribute('aria-describedby', state.describedBy);
    else input.removeAttribute('aria-describedby');
    if (options.error) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');

    const change = () => options.onCheckedChange?.(input.checked);
    input.addEventListener('change', change);
    return () => input.removeEventListener('change', change);
  }, [html, id, options]);

  return <span ref={host} style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={markup} />;
}
