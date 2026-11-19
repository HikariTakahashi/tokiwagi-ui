import { defineComponent, h, type ButtonHTMLAttributes, type PropType } from 'vue';
import { TIcon } from './TIcon';
import { buttonState, type ButtonOptions, type ButtonTone } from '../lib/button';
import type { IconName } from './icon-sources';
import type { ButtonSize } from '../lib/button-size';

export type TButtonProps = Omit<ButtonHTMLAttributes, 'disabled'> & ButtonOptions;

export const TButton = defineComponent({
  name: 'TButton',
  inheritAttrs: false,
  props: {
    tone: { type: String as PropType<ButtonTone>, default: 'neutral' },
    size: { type: String as PropType<ButtonSize>, default: 'lg' },
    leadingIcon: { type: String as PropType<IconName> },
    trailingIcon: { type: String as PropType<IconName> },
    type: { type: String as PropType<ButtonOptions['type']>, default: 'button' },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { tone, size, iconSize, leadingIcon, trailingIcon, type, disabled } = buttonState(props);

      return h('button', {
        ...attrs,
        class: ['tkw-button', attrs.class],
        type,
        disabled,
        'data-tone': tone,
        'data-size': size,
      }, [
        leadingIcon === undefined ? null : h('span', { class: 'tkw-button__icon tkw-button__leading-icon' }, [
          h(TIcon, { name: leadingIcon, size: iconSize }),
        ]),
        h('span', { class: 'tkw-button__label' }, slots.default?.()),
        trailingIcon === undefined ? null : h('span', { class: 'tkw-button__icon tkw-button__trailing-icon' }, [
          h(TIcon, { name: trailingIcon, size: iconSize }),
        ]),
      ]);
    };
  },
});
