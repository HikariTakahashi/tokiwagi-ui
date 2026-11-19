import { linkButtonSizeState, type LinkButtonSize } from '../lib/link-size';
import { defineComponent, h, type AnchorHTMLAttributes, type PropType } from 'vue';
import { linkState, type LinkButtonOptions, type LinkTone, type LinkCurrent } from '../lib/link';
import type { IconName } from '../lib/icon-sources';
import { TIcon } from './TIcon';

export type TLinkButtonProps = Omit<AnchorHTMLAttributes, 'href'> & LinkButtonOptions;

export const TLinkButton = defineComponent({
  name: 'TLinkButton', inheritAttrs: false,
  props: {
    href: { type: String, required: true },
    tone: { type: String as PropType<LinkTone>, default: 'neutral' },
    size: { type: String as PropType<LinkButtonSize>, default: 'lg' },
    leadingIcon: { type: String as PropType<IconName> },
    trailingIcon: { type: String as PropType<IconName> },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const sizing = linkButtonSizeState(props.size);
      const state = linkState({ ...props, target: attrs.target as string | undefined, rel: attrs.rel as string | undefined,
        'aria-current': attrs['aria-current'] as LinkCurrent | undefined }, 'TLinkButton');
      return h('a', { ...attrs, href: state.href, rel: state.rel, class: ['tkw-button', 'tkw-link-button', attrs.class],
        'data-size': sizing.size, 'data-tone': state.tone, 'data-current': state.isCurrent || undefined,
      }, [
        state.leadingIcon === undefined ? null : h('span', { class: 'tkw-button__icon tkw-link-button__leading-icon' }, [h(TIcon, { name: state.leadingIcon, size: sizing.iconSize })]),
        h('span', { class: 'tkw-button__label tkw-link-button__label' }, slots.default?.()),
        state.trailingIcon === undefined ? null : h('span', { class: 'tkw-button__icon tkw-link-button__trailing-icon' }, [h(TIcon, { name: state.trailingIcon, size: sizing.iconSize })]),
      ]);
    };
  },
});
