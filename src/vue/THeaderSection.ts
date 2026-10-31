import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';
import { resolveHeaderSectionPosition, type HeaderSectionPosition } from '../lib/header';

export type THeaderSectionProps = HTMLAttributes & { position: HeaderSectionPosition };

export const THeaderSection = defineComponent({
  name: 'THeaderSection', inheritAttrs: false,
  props: { position: { type: String as PropType<HeaderSectionPosition>, required: true } },
  setup(props, { attrs, slots }) {
    return () => h('div', { ...attrs, class: ['tkw-header-section', attrs.class],
      'data-position': resolveHeaderSectionPosition(props.position),
    }, slots.default?.());
  },
});
