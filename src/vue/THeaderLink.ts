import { defineComponent, h, type AnchorHTMLAttributes, type PropType } from 'vue';
import { headerLinkState, type HeaderLinkOptions, type HeaderLinkCurrent } from '../lib/header-link';
import type { HeaderTone } from '../lib/header';

export type THeaderLinkProps = Omit<AnchorHTMLAttributes, 'href'> & HeaderLinkOptions;

export const THeaderLink = defineComponent({
  name: 'THeaderLink', inheritAttrs: false,
  props: {
    href: { type: String, required: true },
    tone: { type: String as PropType<HeaderTone>, default: 'neutral' },
    iconOnly: { type: Boolean, default: false },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const state = headerLinkState({ ...props, target: attrs.target as string | undefined,
        rel: attrs.rel as string | undefined, 'aria-current': attrs['aria-current'] as HeaderLinkCurrent | undefined });
      return h('a', { ...attrs, href: state.href, rel: state.rel, class: ['tkw-header-button', 'tkw-header-link', attrs.class],
        'data-tone': state.tone, 'data-icon-only': state.iconOnly || undefined, 'data-selected': state.selected || undefined,
      }, slots.default?.());
    };
  },
});
