import type { CardDataAttributes } from '../lib/card';
import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';
import { cardState, type CardOptions } from '../lib/card';

export type TCardProps = HTMLAttributes & CardOptions & CardDataAttributes;
export const TCard = defineComponent({
  name: 'TCard', inheritAttrs: false,
  props: {
    as: String as PropType<CardOptions['as']>,
    variant: String as PropType<CardOptions['variant']>,
    size: String as PropType<CardOptions['size']>,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const state = cardState(props);
      return h(state.tag, { ...attrs, ...state.attributes, class: ['tkw-card', attrs.class] }, slots.default?.());
    };
  },
});
