import { defineComponent, h, type HTMLAttributes } from 'vue';

export type THeaderButtonGroupProps = Omit<HTMLAttributes, 'role'>;

export const THeaderButtonGroup = defineComponent({
  name: 'THeaderButtonGroup', inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, role: 'group', class: ['tkw-header-button-group', attrs.class] }, slots.default?.());
  },
});
