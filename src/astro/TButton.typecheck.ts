import type { TButtonProps, ButtonTone } from 'tokiwagi-ui/astro';

const tone: ButtonTone = 'blue';
const button: TButtonProps = { tone, leadingIcon: 'save', type: 'submit', disabled: false,
  form: 'editor', class: 'save', 'data-action': 'save', 'aria-describedby': 'hint' };
// @ts-expect-error 定義済みの色だけを受け付ける。
const invalidTone: TButtonProps = { tone: 'red' };
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon: TButtonProps = { leadingIcon: 'missing-icon' };
// @ts-expect-error ボタンのtypeだけを受け付ける。
const invalidType: TButtonProps = { type: 'link' };
void [button, invalidTone, invalidIcon, invalidType];
