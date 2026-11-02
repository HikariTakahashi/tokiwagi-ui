export const textSizes = ['sm', 'md', 'lg'] as const;
export type TextSize = typeof textSizes[number];
export type TextResponsiveSize = { base: TextSize; sm?: TextSize; lg?: TextSize };
export const textWeights = ['normal', 'medium', 'semibold', 'bold'] as const;
export type TextWeight = typeof textWeights[number];
export const textTones = ['default', 'muted', 'inherit', 'success', 'warning', 'error', 'info'] as const;
export type TextTone = typeof textTones[number];
export type TextTag = 'span' | 'p';
export type TextAlign = 'start' | 'center' | 'end';
export type TextWhiteSpace = 'normal' | 'pre-line' | 'pre-wrap';
export type TextDecoration = 'none' | 'underline' | 'line-through';
export type TextDataAttributes = { [key: `data-${string}`]: string | number | boolean | null | undefined };
export type TextOptions = {
  as?: TextTag;
  size?: TextSize | TextResponsiveSize;
  weight?: TextWeight;
  lineHeight?: number;
  tone?: TextTone;
  align?: TextAlign;
  truncate?: boolean;
  lineClamp?: number;
  whiteSpace?: TextWhiteSpace;
  inherit?: boolean;
  italic?: boolean;
  decoration?: TextDecoration;
};

const sizeValues: Record<TextSize, string> = { sm: '0.875rem', md: '1rem', lg: '1.125rem' };
const weightValues: Record<TextWeight, string> = { normal: '400', medium: '500', semibold: '600', bold: '700' };

function choice<T extends string>(name: string, value: T, values: readonly T[]): T {
  if (!values.includes(value)) throw new Error(`TTextの${name}には${values.join('/')}を指定してください`);
  return value;
}

/** 3方式で共通の検証とCSS用属性を生成する。未指定と明示値を分けて継承を解決する。 */
export function textState({ as = 'span', size, weight, lineHeight, tone = 'default', align = 'start',
  truncate = false, lineClamp, whiteSpace = 'normal', inherit = false, italic = false, decoration = 'none',
}: TextOptions = {}) {
  const tag = choice('as', as, ['span', 'p']);
  choice('tone', tone, textTones);
  choice('align', align, ['start', 'center', 'end']);
  choice('whiteSpace', whiteSpace, ['normal', 'pre-line', 'pre-wrap']);
  choice('decoration', decoration, ['none', 'underline', 'line-through']);
  for (const [name, value] of Object.entries({ truncate, inherit, italic })) {
    if (typeof value !== 'boolean') throw new Error(`TTextの${name}にはbooleanを指定してください`);
  }
  if (lineHeight !== undefined && (typeof lineHeight !== 'number' || !Number.isFinite(lineHeight) || lineHeight <= 0))
    throw new Error('TTextのlineHeightには有限の正の数値を指定してください');
  if (lineClamp !== undefined && (typeof lineClamp !== 'number' || !Number.isSafeInteger(lineClamp) || lineClamp <= 0))
    throw new Error('TTextのlineClampには正の整数を指定してください');
  if (truncate && lineClamp !== undefined) throw new Error('TTextのtruncateとlineClampは同時に指定できません');
  if (weight !== undefined) choice('weight', weight, textWeights);

  let base = inherit ? 'inherit' : sizeValues.md;
  let sm = base;
  let lg = base;
  if (size !== undefined) {
    if (typeof size === 'string') base = sm = lg = sizeValues[choice('size', size, textSizes)];
    else {
      if (!size || typeof size !== 'object' || Array.isArray(size)
        || Object.keys(size).some(key => !['base', 'sm', 'lg'].includes(key)))
        throw new Error('TTextのsizeにはsm/md/lgまたはbase・sm・lgを持つオブジェクトを指定してください');
      base = sizeValues[choice('size.base', size.base, textSizes)];
      sm = size.sm === undefined ? base : sizeValues[choice('size.sm', size.sm, textSizes)];
      lg = size.lg === undefined ? sm : sizeValues[choice('size.lg', size.lg, textSizes)];
    }
  }
  const style: Record<string, string> = {
    '--tkw-text-size-base': base, '--tkw-text-size-sm': sm, '--tkw-text-size-lg': lg,
    '--tkw-text-weight': weight === undefined ? (inherit ? 'inherit' : '400') : weightValues[weight],
    '--tkw-text-line-height': lineHeight === undefined ? (inherit ? 'inherit' : '1.5') : String(lineHeight),
  };
  if (lineClamp !== undefined) style['--tkw-text-line-clamp'] = String(lineClamp);
  return { tag, style, attributes: {
    'data-tone': tone, 'data-align': align, 'data-white-space': whiteSpace,
    'data-inherit': inherit ? '' : undefined, 'data-italic': italic ? '' : undefined,
    'data-decoration': decoration, 'data-truncate': truncate ? '' : undefined,
    'data-line-clamp': lineClamp === undefined ? undefined : '',
  } };
}
