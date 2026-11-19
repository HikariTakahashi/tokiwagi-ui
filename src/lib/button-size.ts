export const buttonSizes = ['sm', 'md', 'lg'] as const;
export type ButtonSize = typeof buttonSizes[number];

const buttonIconSizes = { sm: 20, md: 24, lg: 32 } as const;

/** 通常ボタンとボタン型リンクの寸法を揃え、未指定では既存のlgを維持する。 */
export function buttonSizeState(size: ButtonSize = 'lg', componentName = 'TButton') {
  if (!buttonSizes.includes(size)) throw new Error(`${componentName}のsizeにはsm/md/lgを指定してください`);
  return { size, iconSize: buttonIconSizes[size] };
}
