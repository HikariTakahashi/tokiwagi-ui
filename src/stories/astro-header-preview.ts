import type { HeaderBackgroundColor } from '../lib/header-background';
import { headerPreviewKey, type HeaderPreviewOptions, type AstroHeaderPreviews } from './header-preview';

export const headerBackgroundPreviewKey = (backgroundColor: HeaderBackgroundColor = '--tkw-color-neutral-0') => `THeaderBackground:${backgroundColor}`;

/** 実Astro外枠と実Astroの子部品を合成し、背景×状態の直積を収録せずに表示する。 */
export function astroHeaderPreviewHtml(previews: AstroHeaderPreviews, options: HeaderPreviewOptions): string {
  const html = previews[headerPreviewKey(options)];
  if (!html) throw new Error('Astroヘッダー見本がありません');
  if (options.component !== 'THeader') return html;
  const frame = previews[headerBackgroundPreviewKey(options.backgroundColor)];
  if (!frame) throw new Error('Astroヘッダー背景見本がありません');
  const source = document.createElement('template'); source.innerHTML = html;
  const target = document.createElement('template'); target.innerHTML = frame;
  const content = source.content.querySelector('.tkw-header__content');
  const destination = target.content.querySelector('.tkw-header__content');
  if (!content || !destination) throw new Error('Astroヘッダー見本に内容領域がありません');
  destination.replaceWith(content);
  return target.innerHTML;
}
