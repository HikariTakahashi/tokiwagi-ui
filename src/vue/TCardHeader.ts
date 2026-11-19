import type { CardDataAttributes } from '../lib/card';
import { defineComponent, h, type HTMLAttributes } from 'vue';

export type TCardHeaderProps = HTMLAttributes & CardDataAttributes;
export const TCardHeader = defineComponent({
  name: 'TCardHeader', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['tkw-card-header', attrs.class] }, slots.default?.());
  },
});
