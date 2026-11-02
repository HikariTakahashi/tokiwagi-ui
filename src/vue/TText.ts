import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';
import { textState, type TextOptions, type TextDataAttributes } from '../lib/text';

export type TTextProps = Omit<HTMLAttributes, keyof TextOptions> & TextOptions & TextDataAttributes;

export const TText = defineComponent({
  name: 'TText', inheritAttrs: false,
  props: {
    as: String as PropType<TextOptions['as']>,
    size: [String, Object] as PropType<TextOptions['size']>,
    weight: String as PropType<TextOptions['weight']>,
    lineHeight: Number,
    tone: String as PropType<TextOptions['tone']>,
    align: String as PropType<TextOptions['align']>,
    truncate: { type: Boolean, default: false },
    lineClamp: Number,
    whiteSpace: String as PropType<TextOptions['whiteSpace']>,
    inherit: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    decoration: String as PropType<TextOptions['decoration']>,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const state = textState(props);
      return h(state.tag, { ...attrs, ...state.attributes, class: ['tkw-text', attrs.class],
        style: [state.style, attrs.style as HTMLAttributes['style']],
      }, slots.default?.());
    };
  },
});
