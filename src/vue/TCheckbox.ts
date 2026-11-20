import { defineComponent, h, mergeProps, nextTick, useId, withDirectives,
  type InputHTMLAttributes, type ObjectDirective, type PropType } from 'vue';
import { checkboxState, type CheckboxOptions, type CheckboxTone } from '../lib/checkbox';

export type TCheckboxProps = Omit<InputHTMLAttributes,
  'type' | 'checked' | 'value' | 'defaultValue' | 'role' | 'aria-checked'> & CheckboxOptions & {
  modelValue?: boolean;
  'onUpdate:modelValue'?: (checked: boolean) => void;
};

const checkboxProperties: ObjectDirective<HTMLInputElement, {
  initial: boolean;
  checked: boolean | undefined;
  indeterminate: boolean;
}> = {
  getSSRProps({ value }) {
    return { checked: value.checked ?? value.initial };
  },
  mounted(input, { value }) {
    input.defaultChecked = value.initial;
    if (value.checked !== undefined) input.checked = value.checked;
    input.indeterminate = value.indeterminate;
  },
  updated(input, { value }) {
    if (value.checked !== undefined) input.checked = value.checked;
    input.indeterminate = value.indeterminate;
  },
};

export const TCheckbox = defineComponent({
  name: 'TCheckbox',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: undefined },
    defaultChecked: { type: Boolean, default: undefined },
    indeterminate: { type: Boolean, default: false },
    label: String,
    description: String,
    error: String,
    tone: String as PropType<CheckboxTone>,
    value: String,
  },
  emits: { 'update:modelValue': (checked: boolean) => typeof checked === 'boolean' },
  setup(props, { attrs, emit }) {
    const generated = `tkw-checkbox-${useId()}`;
    const initial = props.modelValue ?? props.defaultChecked ?? false;
    return () => {
      const { id: providedId, type: _type, checked: _checked, role: _role, 'aria-checked': _ariaChecked,
        'aria-invalid': invalid, 'aria-describedby': describedBy, ...attributes } = attrs;
      const id = String(providedId ?? generated);
      const state = checkboxState(id, props, props.modelValue, describedBy as string | undefined);
      const input = withDirectives(h('input', mergeProps({
        onChange: (event: Event) => {
          const target = event.currentTarget as HTMLInputElement;
          target.indeterminate = state.indeterminate;
          emit('update:modelValue', target.checked);
          void nextTick(() => {
            if (props.modelValue !== undefined) target.checked = props.modelValue;
          });
        },
      }, attributes, {
        id, type: 'checkbox', value: props.value, class: 'tkw-checkbox__input',
        'aria-invalid': props.error ? 'true' : invalid,
        'aria-describedby': state.describedBy,
        'data-tkw-checkbox-mixed': state.indeterminate ? 'true' : undefined,
      })), [[checkboxProperties, { initial, checked: state.checked, indeterminate: state.indeterminate }]]);
      return h('span', { class: 'tkw-checkbox-field' }, [
        h('label', { class: 'tkw-checkbox-field__label', for: id }, [
          h('span', { class: 'tkw-checkbox' }, [
            input,
            h('span', { class: 'tkw-checkbox__box', 'data-tone': state.tone, 'aria-hidden': 'true' }),
          ]),
          props.label ? h('span', { class: 'tkw-checkbox-field__name' }, props.label) : null,
        ]),
        props.description ? h('span', { class: 'tkw-checkbox-field__description', id: state.descriptionId }, props.description) : null,
        props.error ? h('span', { class: 'tkw-checkbox-field__error', id: state.errorId }, `エラー：${props.error}`) : null,
      ]);
    };
  },
});
