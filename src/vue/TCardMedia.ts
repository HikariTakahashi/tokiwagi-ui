import type { CardDataAttributes } from '../lib/card';
import { defineComponent, h, type HTMLAttributes } from 'vue';

export type TCardMediaProps = HTMLAttributes & CardDataAttributes;
export const TCardMedia = defineComponent({
  name: 'TCardMedia', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['tkw-card-media', attrs.class] }, slots.default?.());
  },
});
