import { defineComponent, h, type HTMLAttributes } from 'vue';
import type { SidebarDataAttributes } from '../lib/sidebar';
export type TSidebarFooterProps = HTMLAttributes & SidebarDataAttributes;
export const TSidebarFooter = defineComponent({
  name: 'TSidebarFooter', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['tkw-sidebar-footer', attrs.class] }, slots.default?.());
  },
});
