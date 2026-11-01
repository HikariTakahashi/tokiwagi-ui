import { headerButtonState, type HeaderTone } from './header';

export type HeaderLinkCurrent = boolean | 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
export type HeaderLinkOptions = {
  href: string;
  tone?: HeaderTone;
  iconOnly?: boolean;
  selected?: never;
  disabled?: never;
};

/** 3方式でhref・外観・現在地・別タブのrelを同じ条件で解決する。 */
export function headerLinkState({ href, tone, iconOnly, target, rel, 'aria-current': current }: HeaderLinkOptions & {
  target?: string; rel?: string; 'aria-current'?: HeaderLinkCurrent;
}) {
  if (typeof href !== 'string' || !href.trim()) throw new Error('THeaderLinkのhrefには空白だけではない文字列を指定してください');
  const appearance = headerButtonState({ tone, iconOnly });
  const selected = ['true', 'page', 'step', 'location', 'date', 'time'].includes(String(current));
  if (target?.toLowerCase() === '_blank') {
    const tokens = (rel ?? '').split(/\s+/).filter(token => token && !['opener', 'noopener'].includes(token.toLowerCase()));
    rel = [...tokens, 'noopener'].join(' ');
  }
  return { href, tone: appearance.tone, iconOnly: appearance.iconOnly, selected, rel };
}
