import { defineComponent, h, type ButtonHTMLAttributes, type PropType } from 'vue';
import { TIcon } from './TIcon';
import { buttonState, type ButtonOptions, type ButtonTone } from '../lib/button';
import type { IconName } from './icon-sources';

export type TButtonProps = Omit<ButtonHTMLAttributes, 'disabled'> & ButtonOptions;

export const TButton = defineComponent({
  name: 'TButton',
  inheritAttrs: false,
  props: {
    tone: { type: String as PropType<ButtonTone>, default: 'neutral' },
    leadingIcon: { type: String as PropType<IconName> },
    type: { type: String as PropType<ButtonOptions['type']>, default: 'button' },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { tone, leadingIcon, type, disabled } = buttonState(props);

      return h('button', {
        ...attrs,
        class: ['tkw-button', attrs.class],
        type,
        disabled,
        'data-tone': tone,
      }, [
        leadingIcon === undefined ? null : h('span', { class: 'tkw-button__icon' }, [
          h(TIcon, { name: leadingIcon, size: 32 }),
        ]),
        h('span', { class: 'tkw-button__label' }, slots.default?.()),
      ]);
    };
  },
});
