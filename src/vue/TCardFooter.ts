import type { CardDataAttributes } from '../lib/card';
import { defineComponent, h, type HTMLAttributes } from 'vue';

export type TCardFooterProps = HTMLAttributes & CardDataAttributes;
export const TCardFooter = defineComponent({
  name: 'TCardFooter', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['tkw-card-footer', attrs.class] }, slots.default?.());
  },
});
