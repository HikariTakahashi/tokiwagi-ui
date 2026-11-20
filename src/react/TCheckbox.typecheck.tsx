import { TCheckbox, checkboxTones, type TCheckboxProps } from 'tokiwagi-ui/react';

const props: TCheckboxProps = {
  checked: false, indeterminate: true, tone: checkboxTones[0],
  value: 'work', label: '仕事', name: 'calendar', form: 'editor', required: true,
  onChange: event => { const checked: boolean = event.currentTarget.checked; void checked; },
};
const checkbox = <TCheckbox {...props} />;
// @ts-expect-error mixedはネイティブのindeterminateで指定する。
const invalidChecked = <TCheckbox checked="mixed" />;
// @ts-expect-error 既存の7色にないtoneは指定できない。
const invalidTone = <TCheckbox tone="neutral" />;
// @ts-expect-error 入力の型は固定する。
const invalidType = <TCheckbox type="radio" />;
void [checkbox, invalidChecked, invalidTone, invalidType];
