import { linkSizeState, type LinkSize } from '../lib/link-size';
import { defineComponent, h, type AnchorHTMLAttributes, type PropType } from 'vue';
import { linkState, type LinkOptions, type LinkTone, type LinkCurrent } from '../lib/link';
import type { IconName } from '../lib/icon-sources';
import { TIcon } from './TIcon';

export type TLinkProps = Omit<AnchorHTMLAttributes, 'href'> & LinkOptions;

export const TLink = defineComponent({
  name: 'TLink', inheritAttrs: false,
  props: {
    href: { type: String, required: true },
    tone: { type: String as PropType<LinkTone>, default: 'neutral' },
    size: { type: String as PropType<LinkSize>, default: 'inherit' },
    leadingIcon: { type: String as PropType<IconName> },
    trailingIcon: { type: String as PropType<IconName> },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const sizing = linkSizeState(props.size);
      const state = linkState({ ...props, target: attrs.target as string | undefined, rel: attrs.rel as string | undefined,
        'aria-current': attrs['aria-current'] as LinkCurrent | undefined });
      return h('a', { ...attrs, href: state.href, rel: state.rel, class: ['tkw-link', attrs.class],
        'data-size': sizing.size, 'data-tone': state.tone, 'data-current': state.isCurrent || undefined,
      }, [
        state.leadingIcon === undefined ? null : h('span', { class: 'tkw-link__leading-icon' }, [h(TIcon, { name: state.leadingIcon, size: sizing.iconSize })]),
        h('span', { class: 'tkw-link__label' }, slots.default?.()),
        state.trailingIcon === undefined ? null : h('span', { class: 'tkw-link__trailing-icon' }, [h(TIcon, { name: state.trailingIcon, size: sizing.iconSize })]),
      ]);
    };
  },
});
