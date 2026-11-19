import type { CardDataAttributes } from '../lib/card';
import { defineComponent, h, type AnchorHTMLAttributes } from 'vue';
import { cardActionAreaState, type CardActionAreaOptions } from '../lib/card';

export type TCardActionAreaProps = Omit<AnchorHTMLAttributes, 'href'> & CardActionAreaOptions & CardDataAttributes;
export const TCardActionArea = defineComponent({
  name: 'TCardActionArea', inheritAttrs: false,
  props: { href: { type: String, required: true } },
  setup(props, { attrs, slots }) {
    return () => {
      const state = cardActionAreaState({ href: props.href, target: attrs.target as string | undefined, rel: attrs.rel as string | undefined });
      return h('a', { ...attrs, ...state, class: ['tkw-card-action-area', attrs.class] }, slots.default?.());
    };
  },
});
