import { defineComponent, h, isVNode, Fragment, Comment, Text, type HTMLAttributes, type VNode } from 'vue';
import { sidebarLayoutState, validateSidebarPositions, type SidebarLayoutOptions, type SidebarDataAttributes } from '../lib/sidebar';
import { TSidebar } from './TSidebar';
import { TSidebarMain } from './TSidebarMain';

export type TSidebarLayoutProps = HTMLAttributes & SidebarLayoutOptions & SidebarDataAttributes;
function validateChildren(nodes: VNode[]) {
  const positions: number[] = [];
  function visit(children: VNode[]) {
    for (const child of children) {
      if (!isVNode(child)) throw new Error('TSidebarLayoutの直下にはTSidebarとTSidebarMainを配置してください');
      if (child.type === Comment || (child.type === Text && !String(child.children ?? '').trim())) continue;
      if (child.type === Fragment && Array.isArray(child.children)) { visit(child.children as VNode[]); continue; }
      if (child.type === TSidebarMain) positions.push(1);
      else if (child.type === TSidebar) {
        const side = child.props?.side;
        if (side !== 'left' && side !== 'right') throw new Error('TSidebarのsideにはleftまたはrightを指定してください');
        positions.push(side === 'left' ? 0 : 2);
      } else throw new Error('TSidebarLayoutの直下にはTSidebarとTSidebarMainを配置してください');
    }
  }
  visit(nodes);
  validateSidebarPositions(positions);
}
export const TSidebarLayout = defineComponent({
  name: 'TSidebarLayout', inheritAttrs: false,
  props: { gap: Number, animationDuration: Number },
  setup(props, { attrs, slots }) {
    return () => {
      const children = slots.default?.() ?? [];
      validateChildren(children);
      return h('div', { ...attrs, class: ['tkw-sidebar-layout', attrs.class],
        style: [sidebarLayoutState(props), attrs.style as HTMLAttributes['style']],
      }, children);
    };
  },
});
