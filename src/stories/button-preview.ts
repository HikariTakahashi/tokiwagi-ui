import { buttonState, type ButtonOptions } from '../lib/button';
import { astroPreviewSvg, type AstroIconPreviews } from './components/astro-preview';

export type ButtonPreviewOptions = Required<Pick<ButtonOptions, 'tone' | 'disabled'>> &
  Pick<ButtonOptions, 'size' | 'weight' | 'leadingIcon' | 'trailingIcon'> & { component: 'TButton'; text: string };
export type AstroButtonPreviews = { button: string };

/** 実Astro部品の出力を使い、Controlsの文言をテキストとして反映する。 */
export function astroButtonPreviewHtml(
  previews: AstroButtonPreviews, icons: AstroIconPreviews, options: ButtonPreviewOptions, prefix: string,
): string {
  const state = buttonState(options);
  const template = document.createElement('template');
  template.innerHTML = previews.button;
  const button = template.content.querySelector('button');
  const label = template.content.querySelector('.tkw-button__label');
  if (!button || !label) throw new Error('AstroのTButton見本に必要な要素がありません');
  button.setAttribute('data-tone', state.tone);
  button.setAttribute('data-size', state.size);
  if (state.weight === undefined) button.removeAttribute('data-weight');
  else button.setAttribute('data-weight', state.weight);
  button.toggleAttribute('disabled', state.disabled);
  label.textContent = options.text;
  for (const [side, name] of [['leading', state.leadingIcon], ['trailing', state.trailingIcon]] as const) {
    const icon = button.querySelector(`.tkw-button__${side}-icon`);
    if (!icon) throw new Error('AstroのTButton見本にアイコンの配置先がありません');
    if (name === undefined) icon.remove();
    else icon.innerHTML = astroPreviewSvg(icons, name, state.iconSize, `${prefix}-${side}`);
  }
  return template.innerHTML;
}
