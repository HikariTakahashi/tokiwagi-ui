import { defineComponent, h, type ButtonHTMLAttributes, type PropType } from 'vue';
import { headerButtonState, type HeaderButtonOptions, type HeaderTone } from '../lib/header';

export type THeaderButtonProps = ButtonHTMLAttributes & HeaderButtonOptions;

export const THeaderButton = defineComponent({
  name: 'THeaderButton', inheritAttrs: false,
  props: {
    tone: { type: String as PropType<HeaderTone>, default: 'neutral' },
    iconOnly: { type: Boolean, default: false },
    selected: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: false },
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const state = headerButtonState(props);
      return h('button', { ...attrs, class: ['tkw-header-button', attrs.class], type: state.type,
        disabled: state.disabled, 'data-tone': state.tone, 'data-icon-only': state.iconOnly || undefined,
        'data-selected': state.selected || undefined, 'aria-pressed': state.selected ?? attrs['aria-pressed'],
      }, slots.default?.());
    };
  },
});
