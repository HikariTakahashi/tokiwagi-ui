import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';
import { sidebarMainTag, type SidebarMainOptions, type SidebarDataAttributes } from '../lib/sidebar';

export type TSidebarMainProps = HTMLAttributes & SidebarMainOptions & SidebarDataAttributes;
export const TSidebarMain = defineComponent({
  name: 'TSidebarMain', inheritAttrs: false,
  props: { as: String as PropType<SidebarMainOptions['as']> },
  setup(props, { attrs, slots }) {
    return () => h(sidebarMainTag(props.as), { ...attrs, class: ['tkw-sidebar-main', attrs.class] }, slots.default?.());
  },
});
