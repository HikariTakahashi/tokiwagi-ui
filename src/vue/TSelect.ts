import { defineComponent, h, mergeProps, useId, type PropType, type SelectHTMLAttributes } from 'vue';
import { selectDescribedBy, selectState, selectValue, type SelectOptions, type SelectOption, type SelectSize, type SelectTone } from '../lib/select';
import { TIcon } from './TIcon';

export type TSelectProps = Omit<SelectHTMLAttributes, 'size' | 'multiple' | 'value'> & SelectOptions & {
  modelValue?: string;
  defaultValue?: string;
  'onUpdate:modelValue'?: (value: string) => void;
  multiple?: never;
};

export const TSelect = defineComponent({
  name: 'TSelect', inheritAttrs: false,
  props: {
    options: { type: Array as PropType<readonly SelectOption[]>, required: true },
    modelValue: { type: String }, defaultValue: { type: String },
    placeholder: { type: String }, label: { type: String }, description: { type: String }, error: { type: String },
    tone: { type: String as PropType<SelectTone>, default: 'neutral' },
    size: { type: String as PropType<SelectSize>, default: 'md' },
  },
  emits: { 'update:modelValue': (value: string) => typeof value === 'string' },
  setup(props, { attrs, emit }) {
    const generated = `tkw-select-${useId()}`;
    const initial = selectValue(props.defaultValue);
    return () => {
      const state = selectState(props);
      const id = String(attrs.id ?? generated);
      const value = selectValue(props.modelValue) ?? initial;
      const { value: _value, multiple: _multiple, ...attributes } = attrs;
      return h('span', { class: 'tkw-select-field' }, [
        props.label ? h('label', { class: 'tkw-select-field__label', for: id }, [props.label,
          attrs.required !== undefined && attrs.required !== false ? h('span', { class: 'tkw-select-field__required' }, '必須') : null,
        ]) : null,
        h('span', { class: 'tkw-select' }, [
          h('select', mergeProps(attributes, {
            id, class: 'tkw-select__input', multiple: false,
            ...(props.modelValue === undefined ? {} : { value: props.modelValue }),
            'data-tone': state.tone, 'data-size': state.size,
            'aria-invalid': props.error ? 'true' : attrs['aria-invalid'],
            'aria-describedby': selectDescribedBy(id, props.description, props.error, attrs['aria-describedby'] as string | undefined),
            onChange: (event: Event) => emit('update:modelValue', (event.target as HTMLSelectElement).value),
          }), state.options.map(option => h('option', { key: option.value, value: option.value, disabled: option.disabled,
            selected: value === undefined ? undefined : option.value === value,
          }, option.label))),
          h('span', { class: 'tkw-select__arrow', 'aria-hidden': 'true' }, [h(TIcon, { name: 'chevron-bottom', size: 16 })]),
        ]),
        props.description ? h('span', { class: 'tkw-select-field__description', id: `${id}-description` }, props.description) : null,
        props.error ? h('span', { class: 'tkw-select-field__error', id: `${id}-error` }, `エラー：${props.error}`) : null,
      ]);
    };
  },
});
