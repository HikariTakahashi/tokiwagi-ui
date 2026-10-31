import { defineComponent, h, type HTMLAttributes } from 'vue';

export type THeaderProps = HTMLAttributes & { scrollLabel?: string };

export const THeader = defineComponent({
  name: 'THeader', inheritAttrs: false,
  props: { scrollLabel: { type: String, default: 'ヘッダー操作' } },
  setup(props, { attrs, slots }) {
    return () => h('header', { ...attrs, class: ['tkw-header', attrs.class] }, [
      h('div', { class: 'tkw-header__scroll', role: 'region', 'aria-label': props.scrollLabel, tabindex: 0 }, [
        h('div', { class: 'tkw-header__content' }, slots.default?.()),
      ]),
    ]);
  },
});
