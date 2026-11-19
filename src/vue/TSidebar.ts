import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';
import { sidebarState, type SidebarOptions, type SidebarDataAttributes } from '../lib/sidebar';

export type TSidebarProps = HTMLAttributes & SidebarOptions & SidebarDataAttributes;
export const TSidebar = defineComponent({
  name: 'TSidebar', inheritAttrs: false,
  props: {
    side: { type: String as PropType<SidebarOptions['side']>, required: true },
    open: { type: Boolean, default: true },
    width: Number,
    as: String as PropType<SidebarOptions['as']>,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const state = sidebarState(props);
      return h(state.tag, { ...attrs, class: ['tkw-sidebar', attrs.class],
        style: [state.style, attrs.style as HTMLAttributes['style']],
        'data-side': state.side, 'data-open': String(state.open),
        inert: state.open ? attrs.inert : true,
        'aria-hidden': state.open ? attrs['aria-hidden'] : true,
      }, h('div', { class: 'tkw-sidebar-surface' }, slots.default?.()));
    };
  },
});
