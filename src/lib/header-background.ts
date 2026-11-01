import primaryCss from '../../tokens/colors.css?raw';
import secondaryCss from '../../tokens/secondary.css?raw';
import semanticCss from '../../tokens/semantic.css?raw';
import neutralCss from '../../tokens/neutrals.css?raw';
import { colors, secondaryColors, semanticColors, neutrals, suffixes, parseTokens, parseSecondaryTokens, parseSemanticTokens, parseNeutralTokens, contrast } from './palette';
import { headerTones } from './header';

type Suffix = typeof suffixes[number];
export type HeaderBackgroundColor =
  | `--tkw-color-primary-${typeof colors[number][0]}${Suffix}`
  | `--tkw-color-secondary-${typeof secondaryColors[number][0]}${Suffix}`
  | `--tkw-color-semantic-${typeof semanticColors[number][0]}${Suffix}`
  | `--tkw-color-neutral-${typeof neutrals[number][0]}`;

export const headerBackgroundColors: readonly HeaderBackgroundColor[] = [
  ...neutrals.map(([step]) => `--tkw-color-neutral-${step}` as const),
  ...colors.flatMap(([key]) => suffixes.map(suffix => `--tkw-color-primary-${key}${suffix}` as const)),
  ...secondaryColors.flatMap(([key]) => suffixes.map(suffix => `--tkw-color-secondary-${key}${suffix}` as const)),
  ...semanticColors.flatMap(([key]) => suffixes.map(suffix => `--tkw-color-semantic-${key}${suffix}` as const)),
];
const tokens = { ...parseTokens(primaryCss), ...parseSecondaryTokens(secondaryCss), ...parseSemanticTokens(semanticCss), ...parseNeutralTokens(neutralCss) };
const foregrounds = ['--tkw-color-neutral-900', '--tkw-color-neutral-0', '--tkw-color-neutral-1000'] as const;

/** CSS原本から同じ文字色をSSRとブラウザで選ぶ。任意のCSS色は受け取らない。 */
export function headerBackgroundState(backgroundColor: HeaderBackgroundColor = '--tkw-color-neutral-0') {
  if (!headerBackgroundColors.includes(backgroundColor)) {
    throw new Error('THeaderのbackgroundColorには既存の93カラートークン名を指定してください');
  }
  const readable = (foreground: string) => contrast(tokens[backgroundColor]!, tokens[foreground]!) >= 4.5;
  const foreground = foregrounds.find(readable)!;
  const style: Record<`--${string}`, string> = {
    '--tkw-header-background': `var(${backgroundColor})`,
    '--tkw-header-text': `var(${foreground})`,
  };
  for (const tone of headerTones) {
    const original = tone === 'neutral' ? '--tkw-color-neutral-900' : `--tkw-color-primary-${tone}-on-subtle`;
    style[`--tkw-header-readable-${tone}`] = `var(${readable(original) ? original : foreground})`;
  }
  return { backgroundColor, foreground, style };
}
