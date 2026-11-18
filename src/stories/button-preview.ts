import { buttonState, type ButtonOptions } from '../lib/button';
import { astroPreviewSvg, type AstroIconPreviews } from './components/astro-preview';

export type ButtonPreviewOptions = Required<Pick<ButtonOptions, 'tone' | 'disabled'>> &
  Pick<ButtonOptions, 'leadingIcon'> & { component: 'TButton'; text: string };
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
  const icon = template.content.querySelector('.tkw-button__icon');
  if (!button || !label || !icon) throw new Error('AstroのTButton見本に必要な要素がありません');
  button.setAttribute('data-tone', state.tone);
  button.toggleAttribute('disabled', state.disabled);
  label.textContent = options.text;
  if (state.leadingIcon === undefined) icon.remove();
  else icon.innerHTML = astroPreviewSvg(icons, state.leadingIcon, 32, prefix);
  return template.innerHTML;
}
