import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';

import { headerBackgroundState, type HeaderBackgroundColor } from '../lib/header-background';

export type THeaderProps = HTMLAttributes & { scrollLabel?: string; backgroundColor?: HeaderBackgroundColor };

export const THeader = defineComponent({
  name: 'THeader', inheritAttrs: false,
  props: { backgroundColor: { type: String as PropType<HeaderBackgroundColor>, default: '--tkw-color-neutral-0' }, scrollLabel: { type: String, default: 'ヘッダー操作' } },
  setup(props, { attrs, slots }) {
    return () => {
      const background = headerBackgroundState(props.backgroundColor);
      return h('header', { ...attrs, class: ['tkw-header', attrs.class], 'data-background': background.backgroundColor, style: [background.style, attrs.style as HTMLAttributes['style']] }, [
        h('div', { class: 'tkw-header__scroll', role: 'region', 'aria-label': props.scrollLabel, tabindex: 0 }, [
          h('div', { class: 'tkw-header__content' }, slots.default?.()),
        ]),
      ]);
    };
  },
});
