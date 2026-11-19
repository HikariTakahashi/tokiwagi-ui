export const linkSizes = ['inherit', 'sm', 'md', 'lg'] as const;
export type LinkSize = typeof linkSizes[number];
export const linkButtonSizes = ['sm', 'md', 'lg'] as const;
export type LinkButtonSize = typeof linkButtonSizes[number];

const linkIconSizes = { inherit: 16, sm: 16, md: 16, lg: 20 } as const;
const buttonIconSizes = { sm: 20, md: 24, lg: 32 } as const;

/** 未指定では既存の文字継承と16pxアイコンを維持する。 */
export function linkSizeState(size: LinkSize = 'inherit') {
  if (!linkSizes.includes(size)) throw new Error('TLinkのsizeにはinherit/sm/md/lgを指定してください');
  return { size, iconSize: linkIconSizes[size] };
}

/** ボタン型リンクの未指定は既存のlg。inheritは対象に含めない。 */
export function linkButtonSizeState(size: LinkButtonSize = 'lg') {
  if (!linkButtonSizes.includes(size)) throw new Error('TLinkButtonのsizeにはsm/md/lgを指定してください');
  return { size, iconSize: buttonIconSizes[size] };
}
