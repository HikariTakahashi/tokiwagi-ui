import { isIconName, type IconName } from './icon-sources';

export const linkTones = ['neutral', 'green', 'teal', 'blue', 'violet', 'rose', 'coral', 'amber'] as const;
export type LinkTone = typeof linkTones[number];
export type LinkCurrent = boolean | 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
export type LinkOptions = {
  href: string;
  tone?: LinkTone;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  disabled?: never;
};

/** ネイティブの遷移を維持し、3方式で同じ属性・装飾を解決する。 */
export function linkState({ href, tone = 'neutral', leadingIcon, trailingIcon, target, rel, 'aria-current': current }: LinkOptions & {
  target?: string; rel?: string; 'aria-current'?: LinkCurrent;
}, componentName: 'TLink' | 'TLinkButton' = 'TLink') {
  if (typeof href !== 'string' || !href.trim()) throw new Error(`${componentName}のhrefには空白だけではない文字列を指定してください`);
  if (!linkTones.includes(tone)) throw new Error(`${componentName}のtoneにはneutralまたは7色のプライマリーを指定してください`);
  for (const icon of [leadingIcon, trailingIcon]) {
    if (icon !== undefined && !isIconName(icon)) throw new Error(`存在しないアイコン公開名: ${icon}`);
  }
  if (target?.toLowerCase() === '_blank') {
    const tokens = (rel ?? '').split(/\s+/).filter(token => token && !['opener', 'noopener'].includes(token.toLowerCase()));
    rel = [...tokens, 'noopener'].join(' ');
  }
  const isCurrent = ['true', 'page', 'step', 'location', 'date', 'time'].includes(String(current));
  return { href, tone, leadingIcon, trailingIcon, rel, isCurrent };
}
