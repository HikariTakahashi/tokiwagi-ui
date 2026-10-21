import { colors, secondaryColors, semanticColors } from '../../lib/palette';

/** 一覧で使う前景・背景のトークンの組み合わせ。 */
export const colorPairs = [
  { label: 'ニュートラル', foreground: '--tkw-color-neutral-900', background: '--tkw-color-neutral-0' },
  ...([
    ['primary', colors], ['secondary', secondaryColors], ['semantic', semanticColors],
  ] as const).flatMap(([family, rows]) => rows.flatMap(([key, label]) => [
    { label: `${label} / 通常`, foreground: `--tkw-color-${family}-${key}-on`, background: `--tkw-color-${family}-${key}` },
    { label: `${label} / 淡い背景`, foreground: `--tkw-color-${family}-${key}-on-subtle`, background: `--tkw-color-${family}-${key}-subtle` },
  ])),
];

export function pairStyle(index: number) {
  const pair = colorPairs[index]!;
  return { color: `var(${pair.foreground})`, backgroundColor: `var(${pair.background})` };
}
