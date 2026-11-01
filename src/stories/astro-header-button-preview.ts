import { headerButtonContent, headerButtonText, headerLinkHref, headerPreviewKey, type HeaderPreviewOptions, type AstroHeaderPreviews } from './header-preview';
import { headerLinkState } from '../lib/header-link';
import { astroPreviewSvg, type AstroIconPreviews } from './components/astro-preview';

/** 実Astroボタンの状態を保持し、実TIcon出力とテキストだけをslotの位置に組み立てる。 */
export function astroHeaderButtonPreviewHtml(previews: AstroHeaderPreviews, icons: AstroIconPreviews, options: HeaderPreviewOptions, prefix: string): string {
  const html = previews[headerPreviewKey(options)];
  if (!html) throw new Error('Astroヘッダーボタン見本がありません');
  const template = document.createElement('template');
  template.innerHTML = html;
  const button = template.content.querySelector(options.component === 'THeaderLink' ? 'a' : 'button');
  if (!button) throw new Error('Astroヘッダー見本に操作要素がありません');
  if (options.component === 'THeaderLink') {
    const state = headerLinkState({ href: headerLinkHref(options), target: options.target });
    button.setAttribute('href', state.href);
    if (options.target) button.setAttribute('target', options.target); else button.removeAttribute('target');
    if (state.rel) button.setAttribute('rel', state.rel); else button.removeAttribute('rel');
  }
  const content = headerButtonContent(options);
  const text = headerButtonText(options);
  button.replaceChildren();
  if (content !== 'text') {
    const icon = document.createElement('template');
    icon.innerHTML = astroPreviewSvg(icons, options.icon ?? 'share', 24, prefix);
    button.append(icon.content);
  }
  if (content === 'icon') button.setAttribute('aria-label', text);
  else { button.removeAttribute('aria-label'); button.append(document.createTextNode(text)); }
  return template.innerHTML;
}
