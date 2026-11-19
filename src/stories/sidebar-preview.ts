import { sidebarState, sidebarMainTag, sidebarLayoutState, type SidebarSide, type SidebarTag, type SidebarMainTag } from '../lib/sidebar';
import type { Framework } from './components/astro-component-preview';

export type SidebarComponent = 'TSidebarLayout' | 'TSidebar' | 'TSidebarMain' | 'TSidebarHeader' | 'TSidebarBody' | 'TSidebarFooter';
export type SidebarPreviewOptions = {
  component: SidebarComponent; sidebarPart: true; framework: Framework;
  view: 'left' | 'right' | 'both'; side: SidebarSide; open: boolean; width: number;
  leftOpen: boolean; rightOpen: boolean; gap: number; animationDuration: number; as: SidebarTag | SidebarMainTag;
};
export type AstroSidebarPreviews = Record<string, string>;
export function sidebarPreviewState(args: SidebarPreviewOptions) {
  const layout = args.component === 'TSidebarLayout';
  const view = layout ? args.view : args.component === 'TSidebar' ? args.side : 'left';
  if (!['left', 'right', 'both'].includes(view)) throw new Error('サイドバー見本のviewにはleft/right/bothを指定してください');
  const sidebarAs = args.component === 'TSidebar' ? args.as as SidebarTag : 'aside';
  const mainAs = sidebarMainTag(args.component === 'TSidebarMain' ? args.as as SidebarMainTag : 'div');
  return { view, sidebarAs, mainAs, layout: sidebarLayoutState(args),
    left: sidebarState({ side: 'left', as: sidebarAs, width: args.width, open: layout ? args.leftOpen : args.open }),
    right: sidebarState({ side: 'right', as: sidebarAs, width: args.width, open: layout ? args.rightOpen : args.open }),
    key: `${view}:${sidebarAs}:${mainAs}`,
  };
}

/** 既存ノードの状態だけを更新し、Controlsによる開閉でも幅の遷移を維持する。 */
export function updateAstroSidebarPreview(host: HTMLElement, previews: AstroSidebarPreviews, args: SidebarPreviewOptions) {
  const state = sidebarPreviewState(args);
  if (host.dataset.sidebarTemplate !== state.key) {
    if (!previews[state.key]) throw new Error('Astroのサイドバー見本がありません');
    host.innerHTML = previews[state.key];
    host.dataset.sidebarTemplate = state.key;
  }
  const layout = host.querySelector<HTMLElement>('.tkw-sidebar-layout')!;
  for (const [name, value] of Object.entries(state.layout)) layout.style.setProperty(name, value);
  for (const sidebar of host.querySelectorAll<HTMLElement>('.tkw-sidebar')) {
    const value = sidebar.dataset.side === 'left' ? state.left : state.right;
    for (const [name, width] of Object.entries(value.style)) sidebar.style.setProperty(name, width);
    sidebar.dataset.open = String(value.open);
    sidebar.toggleAttribute('inert', !value.open);
    if (value.open) sidebar.removeAttribute('aria-hidden'); else sidebar.setAttribute('aria-hidden', 'true');
  }
}
