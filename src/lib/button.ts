import { isIconName, type IconName } from './icon-sources';

export const buttonTones = ['neutral', 'green', 'teal', 'blue', 'violet', 'rose', 'coral', 'amber'] as const;
export type ButtonTone = typeof buttonTones[number];
export type ButtonOptions = {
  tone?: ButtonTone;
  leadingIcon?: IconName;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export function buttonState({
  tone = 'neutral', leadingIcon, type = 'button', disabled = false,
}: ButtonOptions = {}) {
  if (!buttonTones.includes(tone)) {
    throw new Error('TButtonのtoneにはneutralまたは7色のプライマリーを指定してください');
  }
  if (!['button', 'submit', 'reset'].includes(type)) {
    throw new Error('TButtonのtypeにはbutton/submit/resetを指定してください');
  }
  if (typeof disabled !== 'boolean') {
    throw new Error('TButtonのdisabledにはbooleanを指定してください');
  }
  if (leadingIcon !== undefined && !isIconName(leadingIcon)) {
    throw new Error(`存在しないアイコン公開名: ${leadingIcon}`);
  }
  return { tone, leadingIcon, type, disabled };
}
