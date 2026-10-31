import type { LogoSize } from '../lib/logo';
import { resolveBrandText } from '../lib/brand';

export type AstroBrandPreviews = Record<LogoSize, string>;

/** 実Astro出力の名称だけを変更する。入力をHTMLとして解釈しない。Storybook専用。 */
export function astroBrandPreviewHtml(previews: AstroBrandPreviews, size: LogoSize, text?: string): string {
  const template = document.createElement('template');
  template.innerHTML = previews[size];
  template.content.firstElementChild!.lastElementChild!.textContent = resolveBrandText(text);
  return template.innerHTML;
}
