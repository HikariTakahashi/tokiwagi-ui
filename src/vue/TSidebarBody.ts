import { defineComponent, h, type HTMLAttributes } from 'vue';
import type { SidebarDataAttributes } from '../lib/sidebar';
export type TSidebarBodyProps = HTMLAttributes & SidebarDataAttributes;
export const TSidebarBody = defineComponent({
  name: 'TSidebarBody', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['tkw-sidebar-body', attrs.class] }, slots.default?.());
  },
});
