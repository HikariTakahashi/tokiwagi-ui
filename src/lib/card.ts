export const cardVariants = ['outline', 'elevated', 'subtle'] as const;
export const cardSizes = ['sm', 'md', 'lg'] as const;
export const cardTags = ['div', 'article', 'section'] as const;
export const cardTitleTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
export type CardVariant = typeof cardVariants[number];
export type CardSize = typeof cardSizes[number];
export type CardTag = typeof cardTags[number];
export type CardTitleTag = typeof cardTitleTags[number];
export type CardDataAttributes = { [key: `data-${string}`]: string | number | boolean | null | undefined };
export type CardOptions = { variant?: CardVariant; size?: CardSize; as?: CardTag };
export type CardTitleOptions = { as?: CardTitleTag };
export type CardActionAreaOptions = { href: string; disabled?: never };

function choice<T extends string>(name: string, value: T, values: readonly T[]): T {
  if (!values.includes(value)) throw new Error(`${name}には${values.join('/')}を指定してください`);
  return value;
}

/** 全方式で同じ既定値と不正値の扱いを使う。IDや操作状態は利用側が管理する。 */
export function cardState({ variant = 'outline', size = 'md', as = 'div' }: CardOptions = {}) {
  return { tag: choice('TCardのas', as, cardTags), attributes: {
    'data-variant': choice('TCardのvariant', variant, cardVariants),
    'data-size': choice('TCardのsize', size, cardSizes),
  } };
}
export function cardTitleTag(as: CardTitleTag = 'h3') {
  return choice('TCardTitleのas', as, cardTitleTags);
}
export function cardActionAreaState({ href, target, rel }: CardActionAreaOptions & { target?: string; rel?: string }) {
  if (typeof href !== 'string' || !href.trim()) throw new Error('TCardActionAreaのhrefには空白だけではない文字列を指定してください');
  if (target?.toLowerCase() === '_blank') {
    const tokens = (rel ?? '').split(/\s+/).filter(token => token && !['opener', 'noopener'].includes(token.toLowerCase()));
    rel = [...tokens, 'noopener'].join(' ');
  }
  return { href, rel };
}
