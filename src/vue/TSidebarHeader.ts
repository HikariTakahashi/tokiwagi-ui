import { defineComponent, h, type HTMLAttributes } from 'vue';
import type { SidebarDataAttributes } from '../lib/sidebar';
export type TSidebarHeaderProps = HTMLAttributes & SidebarDataAttributes;
export const TSidebarHeader = defineComponent({
  name: 'TSidebarHeader', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['tkw-sidebar-header', attrs.class] }, slots.default?.());
  },
});
