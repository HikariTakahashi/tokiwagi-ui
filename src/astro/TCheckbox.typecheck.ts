import { checkboxTones, type TCheckboxProps } from 'tokiwagi-ui/astro';

const props: TCheckboxProps = {
  checked: false, indeterminate: true, tone: checkboxTones[0], value: 'work',
  name: 'calendar', form: 'editor', label: '仕事', required: true,
};
// @ts-expect-error 一部選択に文字列は指定できない。
const invalidMixed: TCheckboxProps = { indeterminate: 'mixed' };
// @ts-expect-error 入力の型は固定する。
const invalidType: TCheckboxProps = { type: 'radio' };
void [props, invalidMixed, invalidType];
