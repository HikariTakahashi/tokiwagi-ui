import { buttonSizes, type TButtonProps, type ButtonTone, type ButtonSize, type ButtonOptions } from 'tokiwagi-ui/astro';

const tone: ButtonTone = 'blue';
const size: ButtonSize = buttonSizes[2];
const options: ButtonOptions = { size, leadingIcon: 'save', trailingIcon: 'tool' };
const button: TButtonProps = { ...options, tone, type: 'submit', disabled: false,
  form: 'editor', class: 'save', 'data-action': 'save', 'aria-describedby': 'hint' };
// @ts-expect-error 定義済みの色だけを受け付ける。
const invalidTone: TButtonProps = { tone: 'red' };
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon: TButtonProps = { leadingIcon: 'missing-icon' };
// @ts-expect-error ボタンのtypeだけを受け付ける。
const invalidType: TButtonProps = { type: 'link' };
// @ts-expect-error 末尾にも登録済みアイコンだけを指定する。
const invalidTrailingIcon: TButtonProps = { trailingIcon: 'missing-icon' };
// @ts-expect-error 通常ボタンはinheritサイズを受け付けない。
const invalidSize: TButtonProps = { size: 'inherit' };
void [button, invalidTone, invalidIcon, invalidType, invalidTrailingIcon, invalidSize];
