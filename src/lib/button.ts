import { isIconName, type IconName } from './icon-sources';
import { buttonSizeState, type ButtonSize } from './button-size';

export const buttonTones = ['neutral', 'neutral-0', 'neutral-600', 'neutral-800', 'neutral-900',
  'green', 'teal', 'blue', 'violet', 'rose', 'coral', 'amber'] as const;
export type ButtonTone = typeof buttonTones[number];
export type ButtonOptions = {
  tone?: ButtonTone;
  size?: ButtonSize;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

/** ボタンとボタン型リンクの配色を同じ候補で検証する。 */
export function buttonToneState(tone: ButtonTone = 'neutral', componentName = 'TButton') {
  if (!buttonTones.includes(tone)) {
    throw new Error(`${componentName}のtoneにはneutral、neutral-0/600/800/900または7色のプライマリーを指定してください`);
  }
  return tone;
}

/** 操作部品の無効状態を共通の規則で検証する。 */
export function buttonDisabledState(disabled: boolean = false, componentName = 'TButton') {
  if (typeof disabled !== 'boolean') throw new Error(`${componentName}のdisabledにはbooleanを指定してください`);
  return disabled;
}

export function buttonState({
  tone = 'neutral', size, leadingIcon, trailingIcon, type = 'button', disabled = false,
}: ButtonOptions = {}) {
  buttonToneState(tone);
  if (!['button', 'submit', 'reset'].includes(type)) {
    throw new Error('TButtonのtypeにはbutton/submit/resetを指定してください');
  }
  buttonDisabledState(disabled);
  for (const name of [leadingIcon, trailingIcon]) {
    if (name !== undefined && !isIconName(name)) throw new Error(`存在しないアイコン公開名: ${name}`);
  }
  return { tone, leadingIcon, trailingIcon, type, disabled, ...buttonSizeState(size) };
}
