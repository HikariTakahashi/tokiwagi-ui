import { textState, type TextOptions, type TextTag } from '../lib/text';
export type TextPreviewOptions = TextOptions & { component: 'TText'; text: string };
export type AstroTextPreviews = Record<TextTag, string>;

/** 実Astroテンプレートに共通処理の属性と文言を反映する。入力をHTMLとして解釈しない。 */
export function astroTextPreviewHtml(previews: AstroTextPreviews, options: TextPreviewOptions): string {
  const state = textState(options);
  const template = document.createElement('template');
  template.innerHTML = previews[state.tag];
  const element = template.content.firstElementChild as HTMLElement;
  for (const [name, value] of Object.entries(state.attributes)) {
    if (value === undefined) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
  element.removeAttribute('style');
  for (const [name, value] of Object.entries(state.style)) element.style.setProperty(name, value);
  element.textContent = options.text;
  return template.innerHTML;
}
