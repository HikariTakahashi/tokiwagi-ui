import { TSidebarLayout, TSidebar, TSidebarMain, TSidebarHeader, TSidebarBody, TSidebarFooter } from 'tokiwagi-ui/react';
import * as VueSidebar from 'tokiwagi-ui/vue';
import { h } from 'vue';
import { useEffect, useRef } from 'react';
import type { SidebarSide } from '../../lib/sidebar';
import { sidebarPreviewState, updateAstroSidebarPreview, type SidebarPreviewOptions, type AstroSidebarPreviews } from '../sidebar-preview';
export type { SidebarPreviewOptions, SidebarComponent } from '../sidebar-preview';

export function SidebarPreview(args: SidebarPreviewOptions) {
  const state = sidebarPreviewState(args);
  const sidebar = (side: SidebarSide) => <TSidebar side={side}
    open={state[side].open} width={args.width} as={state.sidebarAs} aria-label={side === 'left' ? '目次' : '補足情報'}>
    <TSidebarHeader><strong>{side === 'left' ? '目次' : '補足情報'}</strong></TSidebarHeader>
    <TSidebarBody><p className="tkw-sidebar-example-copy">{side === 'left' ? 'ガイドライン・プライマリー・ニュートラル' : '表示内容は利用側で自由に組み立てます。'}</p></TSidebarBody>
    <TSidebarFooter><small>Tokiwagi UI</small></TSidebarFooter>
  </TSidebar>;
  return <TSidebarLayout gap={args.gap} animationDuration={args.animationDuration}>
    {state.view !== 'right' && sidebar('left')}
    <TSidebarMain as={state.mainAs}>
      <p className="tkw-sidebar-example-main">中央領域</p>
    </TSidebarMain>
    {state.view !== 'left' && sidebar('right')}
  </TSidebarLayout>;
}

export function vueSidebarPreview(args: SidebarPreviewOptions) {
  const state = sidebarPreviewState(args);
  const sidebar = (side: SidebarSide) => h(VueSidebar.TSidebar, { side, as: state.sidebarAs,
    open: state[side].open, width: args.width, 'aria-label': side === 'left' ? '目次' : '補足情報' }, () => [
    h(VueSidebar.TSidebarHeader, null, () => h('strong', side === 'left' ? '目次' : '補足情報')),
    h(VueSidebar.TSidebarBody, null, () => h('p', { class: 'tkw-sidebar-example-copy' }, side === 'left'
      ? 'ガイドライン・プライマリー・ニュートラル' : '表示内容は利用側で自由に組み立てます。')),
    h(VueSidebar.TSidebarFooter, null, () => h('small', 'Tokiwagi UI')),
  ]);
  return h(VueSidebar.TSidebarLayout, { gap: args.gap, animationDuration: args.animationDuration }, () => [
    state.view !== 'right' ? sidebar('left') : null,
    h(VueSidebar.TSidebarMain, { as: state.mainAs }, () => h('p', { class: 'tkw-sidebar-example-main' }, '中央領域')),
    state.view !== 'left' ? sidebar('right') : null,
  ]);
}

export function AstroSidebarPreview({ previews, options }: { previews: AstroSidebarPreviews; options: SidebarPreviewOptions }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => { updateAstroSidebarPreview(host.current!, previews, options); }, [previews, options]);
  return <div ref={host} />;
}
