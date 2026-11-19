import type { CardDataAttributes } from '../lib/card';
import { defineComponent, h, type HTMLAttributes } from 'vue';

export type TCardBodyProps = HTMLAttributes & CardDataAttributes;
export const TCardBody = defineComponent({
  name: 'TCardBody', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['tkw-card-body', attrs.class] }, slots.default?.());
  },
});
