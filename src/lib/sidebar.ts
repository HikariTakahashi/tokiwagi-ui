export const sidebarSides = ['left', 'right'] as const;
export const sidebarTags = ['aside', 'div'] as const;
export const sidebarMainTags = ['div', 'main'] as const;
export type SidebarSide = typeof sidebarSides[number];
export type SidebarTag = typeof sidebarTags[number];
export type SidebarMainTag = typeof sidebarMainTags[number];
export type SidebarLayoutOptions = { gap?: number; animationDuration?: number };
export type SidebarOptions = { side: SidebarSide; open?: boolean; width?: number; as?: SidebarTag };
export type SidebarMainOptions = { as?: SidebarMainTag };
export type SidebarDataAttributes = { [key: `data-${string}`]: unknown };

function dimension(value: number, name: string, positive = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || (positive ? value <= 0 : value < 0))
    throw new Error(`${name}には${positive ? '0より大きい' : '0以上の'}有限数を指定してください`);
  return value;
}

export function sidebarLayoutState({ gap = 24, animationDuration = 200 }: SidebarLayoutOptions) {
  return { '--tkw-sidebar-gap': `${dimension(gap, 'TSidebarLayoutのgap')}px`,
    '--tkw-sidebar-duration': `${dimension(animationDuration, 'TSidebarLayoutのanimationDuration')}ms` };
}

export function sidebarState({ side, open = true, width = 280, as = 'aside' }: SidebarOptions) {
  if (!sidebarSides.includes(side)) throw new Error('TSidebarのsideにはleftまたはrightを指定してください');
  if (typeof open !== 'boolean') throw new Error('TSidebarのopenにはbooleanを指定してください');
  if (!sidebarTags.includes(as)) throw new Error('TSidebarのasにはasideまたはdivを指定してください');
  return { side, open, tag: as, style: { '--tkw-sidebar-width': `${dimension(width, 'TSidebarのwidth', true)}px` } };
}

export function sidebarMainTag(as: SidebarMainTag = 'div') {
  if (!sidebarMainTags.includes(as)) throw new Error('TSidebarMainのasにはdivまたはmainを指定してください');
  return as;
}

/** 0=左、1=中央、2=右。各方式で同じ個数・DOM順の制約を適用する。 */
export function validateSidebarPositions(positions: readonly number[]) {
  if (positions.filter(position => position === 1).length !== 1 || new Set(positions).size !== positions.length
    || positions.some((position, index) => index > 0 && position < positions[index - 1]!))
    throw new Error('TSidebarLayoutは左・中央・右の順に各1つまで配置し、TSidebarMainを1つ指定してください');
}
