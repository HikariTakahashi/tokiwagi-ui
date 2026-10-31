import { headerButtonContent, headerButtonText, headerPreviewKey, type HeaderPreviewOptions, type AstroHeaderPreviews } from './header-preview';
import { astroPreviewSvg, type AstroIconPreviews } from './components/astro-preview';

/** 実Astroボタンの状態を保持し、実TIcon出力とテキストだけをslotの位置に組み立てる。 */
export function astroHeaderButtonPreviewHtml(previews: AstroHeaderPreviews, icons: AstroIconPreviews, options: HeaderPreviewOptions, prefix: string): string {
  const html = previews[headerPreviewKey(options)];
  if (!html) throw new Error('Astroヘッダーボタン見本がありません');
  const template = document.createElement('template');
  template.innerHTML = html;
  const button = template.content.querySelector('button');
  if (!button) throw new Error('Astroヘッダーボタン見本にbuttonがありません');
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
