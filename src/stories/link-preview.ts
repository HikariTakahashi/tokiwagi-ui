import { linkState, type LinkOptions, type LinkCurrent } from '../lib/link';
import { astroPreviewSvg, type AstroIconPreviews } from './components/astro-preview';

export type LinkPreviewOptions = LinkOptions & {
  component: 'TLink'; text: string; target?: string; rel?: string; current?: LinkCurrent;
};
export type AstroLinkPreviews = { link: string };

/** 実Astro出力を使い、文言と属性をDOM APIで安全に反映する。 */
export function astroLinkPreviewHtml(previews: AstroLinkPreviews, icons: AstroIconPreviews, options: LinkPreviewOptions, prefix: string): string {
  const state = linkState({ ...options, 'aria-current': options.current });
  const template = document.createElement('template');
  template.innerHTML = previews.link;
  const link = template.content.querySelector('a');
  const label = template.content.querySelector('.tkw-link__label');
  if (!link || !label) throw new Error('AstroのTLink見本に必要な要素がありません');
  for (const [key, value] of Object.entries({ href: state.href, target: options.target, rel: state.rel,
    'aria-current': options.current, 'data-tone': state.tone, 'data-current': state.isCurrent || undefined })) {
    if (value === undefined) link.removeAttribute(key);
    else link.setAttribute(key, String(value));
  }
  label.textContent = options.text;
  for (const [side, name] of [['leading', state.leadingIcon], ['trailing', state.trailingIcon]] as const) {
    const icon = link.querySelector(`.tkw-link__${side}-icon`);
    if (!icon) throw new Error('AstroのTLink見本にアイコンの配置先がありません');
    if (name === undefined) icon.remove();
    else icon.innerHTML = astroPreviewSvg(icons, name, 16, `${prefix}-${side}`);
  }
  return template.innerHTML;
}
