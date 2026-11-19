import type { CardDataAttributes } from '../lib/card';
import { defineComponent, h, type HTMLAttributes } from 'vue';

export type TCardDescriptionProps = HTMLAttributes & CardDataAttributes;
export const TCardDescription = defineComponent({
  name: 'TCardDescription', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('p', { ...attrs, class: ['tkw-card-description', attrs.class] }, slots.default?.());
  },
});
