import { linkButtonSizeState, type LinkButtonSize } from '../lib/link-size';
import { defineComponent, h, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type PropType } from 'vue';
import type { LinkButtonOptions, LinkCurrent } from '../lib/link';
import type { ButtonTone } from '../lib/button';
import { linkButtonState, linkButtonAttributes, stopDisabledLinkActivation } from '../lib/link-button';
import type { IconName } from '../lib/icon-sources';
import { TIcon } from './TIcon';

export type TLinkButtonProps = Omit<AnchorHTMLAttributes, 'href'> & Pick<ButtonHTMLAttributes, 'autofocus'> & LinkButtonOptions;

export const TLinkButton = defineComponent({
  name: 'TLinkButton', inheritAttrs: false,
  props: {
    href: { type: String, required: true },
    tone: { type: String as PropType<ButtonTone>, default: 'neutral' },
    size: { type: String as PropType<LinkButtonSize>, default: 'lg' },
    leadingIcon: { type: String as PropType<IconName> },
    trailingIcon: { type: String as PropType<IconName> },
    disabled: { type: Boolean, default: false },
    autofocus: { type: [Boolean, String] as PropType<ButtonHTMLAttributes['autofocus']>, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const sizing = linkButtonSizeState(props.size);
      const state = linkButtonState({ ...props, target: attrs.target as string | undefined, rel: attrs.rel as string | undefined,
        'aria-current': attrs['aria-current'] as LinkCurrent | undefined });
      const forwarded = linkButtonAttributes(attrs, state.disabled);
      return h('a', { ...forwarded, href: state.disabled ? undefined : state.href, rel: state.disabled ? undefined : state.rel,
        autofocus: state.disabled ? undefined : props.autofocus,
        role: state.disabled ? 'link' : attrs.role, 'aria-disabled': state.disabled ? true : attrs['aria-disabled'],
        ...(state.disabled ? Object.fromEntries(['onClick', 'onDblclick', 'onAuxclick', 'onKeydown', 'onKeyup'].map(name => [name, stopDisabledLinkActivation])) : {}),
        class: ['tkw-button', 'tkw-link-button', attrs.class],
        'data-size': sizing.size, 'data-tone': state.tone, 'data-current': state.isCurrent || undefined, 'data-disabled': state.disabled || undefined,
      }, [
        state.leadingIcon === undefined ? null : h('span', { class: 'tkw-button__icon tkw-link-button__leading-icon' }, [h(TIcon, { name: state.leadingIcon, size: sizing.iconSize })]),
        h('span', { class: 'tkw-button__label tkw-link-button__label' }, slots.default?.()),
        state.trailingIcon === undefined ? null : h('span', { class: 'tkw-button__icon tkw-link-button__trailing-icon' }, [h(TIcon, { name: state.trailingIcon, size: sizing.iconSize })]),
      ]);
    };
  },
});
