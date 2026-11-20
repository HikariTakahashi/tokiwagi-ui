import { h } from 'vue';
import { TCheckbox, checkboxTones, type TCheckboxProps } from 'tokiwagi-ui/vue';

const props: TCheckboxProps = {
  modelValue: false, indeterminate: true, tone: checkboxTones[0], value: 'work',
  name: 'calendar', form: 'editor', label: '仕事', required: true,
  'onUpdate:modelValue': value => { const checked: boolean = value; void checked; },
};
const checkbox = h(TCheckbox, props);
// @ts-expect-error v-modelはbooleanに限定する。
const invalidModel: TCheckboxProps = { modelValue: 'mixed' };
// @ts-expect-error 入力の型は固定する。
const invalidType: TCheckboxProps = { type: 'radio' };
void [checkbox, invalidModel, invalidType];
