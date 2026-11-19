import type { CardDataAttributes } from '../lib/card';
import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';
import { cardTitleTag, type CardTitleOptions } from '../lib/card';

export type TCardTitleProps = HTMLAttributes & CardTitleOptions & CardDataAttributes;
export const TCardTitle = defineComponent({
  name: 'TCardTitle', inheritAttrs: false,
  props: { as: String as PropType<CardTitleOptions['as']> },
  setup(props, { attrs, slots }) {
    return () => h(cardTitleTag(props.as), { ...attrs, class: ['tkw-card-title', attrs.class] }, slots.default?.());
  },
});
