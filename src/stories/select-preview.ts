import { selectState, type SelectOptions } from '../lib/select';

export type SelectPreviewOptions = Omit<SelectOptions, 'options'> & {
  component: 'TSelect'; value: string; disabled: boolean; required: boolean; disableCard: boolean;
  onValueChange?: (value: string) => void;
};
export type AstroSelectPreviews = { select: string };
export const selectExampleOptions = (disabled = false) => [
  { value: 'button', label: 'ボタン' }, { value: 'label', label: 'ラベル' }, { value: 'card', label: 'カード', disabled },
];

/** 実Astro出力に設定を反映し、ラベル・説明のIDをインスタンスごとに分離する。 */
export function astroSelectPreviewHtml(previews: AstroSelectPreviews, options: SelectPreviewOptions, prefix: string) {
  const state = selectState({ ...options, options: selectExampleOptions(options.disableCard) });
  const template = document.createElement('template');
  template.innerHTML = previews.select;
  const input = template.content.querySelector('select');
  if (!input) throw new Error('AstroのTSelect見本に入力要素がありません');
  const id = `${prefix}-select`;
  input.id = id;
  input.name = 'example';
  input.setAttribute('aria-label', options.label || '見本');
  input.setAttribute('data-tone', state.tone);
  input.setAttribute('data-size', state.size);
  input.disabled = options.disabled;
  input.required = options.required;
  if (options.error) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  input.replaceChildren(...state.options.map(option => {
    const node = document.createElement('option');
    node.value = option.value; node.textContent = option.label;
    node.disabled = option.disabled ?? false;
    node.defaultSelected = option.value === options.value;
    return node;
  }));
  const describedBy: string[] = [];
  for (const [selector, text, suffix] of [
    ['.tkw-select-field__description', options.description, 'description'],
    ['.tkw-select-field__error', options.error ? `エラー：${options.error}` : '', 'error'],
  ]) {
    const node = template.content.querySelector(selector!);
    if (!node) throw new Error('AstroのTSelect見本に説明の配置先がありません');
    if (text) { node.textContent = text; node.id = `${id}-${suffix}`; describedBy.push(node.id); }
    else node.remove();
  }
  if (describedBy.length) input.setAttribute('aria-describedby', describedBy.join(' '));
  else input.removeAttribute('aria-describedby');
  const label = template.content.querySelector('label');
  if (!label) throw new Error('AstroのTSelect見本にラベルの配置先がありません');
  if (options.label) {
    label.htmlFor = id; label.textContent = options.label;
    if (options.required) {
      const required = document.createElement('span'); required.className = 'tkw-select-field__required'; required.textContent = '必須'; label.append(required);
    }
  } else label.remove();
  return template.innerHTML;
}
