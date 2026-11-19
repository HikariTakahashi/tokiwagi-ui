import { isIconName, type IconName } from './icon-sources';

export const buttonTones = ['neutral', 'green', 'teal', 'blue', 'violet', 'rose', 'coral', 'amber'] as const;
export type ButtonTone = typeof buttonTones[number];
export type ButtonOptions = {
  tone?: ButtonTone;
  leadingIcon?: IconName;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

/** 操作部品の無効状態を共通の規則で検証する。 */
export function buttonDisabledState(disabled: boolean = false, componentName = 'TButton') {
  if (typeof disabled !== 'boolean') throw new Error(`${componentName}のdisabledにはbooleanを指定してください`);
  return disabled;
}

export function buttonState({
  tone = 'neutral', leadingIcon, type = 'button', disabled = false,
}: ButtonOptions = {}) {
  if (!buttonTones.includes(tone)) {
    throw new Error('TButtonのtoneにはneutralまたは7色のプライマリーを指定してください');
  }
  if (!['button', 'submit', 'reset'].includes(type)) {
    throw new Error('TButtonのtypeにはbutton/submit/resetを指定してください');
  }
  buttonDisabledState(disabled);
  if (leadingIcon !== undefined && !isIconName(leadingIcon)) {
    throw new Error(`存在しないアイコン公開名: ${leadingIcon}`);
  }
  return { tone, leadingIcon, type, disabled };
}
