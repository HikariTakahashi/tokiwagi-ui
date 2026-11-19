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

const neutralTones = ['neutral-0', 'neutral-600', 'neutral-800', 'neutral-900'] as const;
const neutralProps: TButtonProps[] = neutralTones.map(tone => ({ tone }));
// @ts-expect-error 無効状態用の400は通常のtoneに公開しない。
const disabledTone: TButtonProps = { tone: 'neutral-400' };
void [neutralProps, disabledTone];

// TTextと同じ4段階の公開型を受け付け、未指定と文字列inheritを区別する。
const weightedProps: TButtonProps[] = (['normal', 'medium', 'semibold', 'bold'] as const)
  .map(weight => ({ weight }));
// @ts-expect-error 継承する場合はweightを省略する。
const invalidWeight: TButtonProps = { weight: 'inherit' };
// @ts-expect-error 太さの指定は数値ではなくTText共通の名前を使う。
const numericWeight: TButtonProps = { weight: 700 };
void [weightedProps, invalidWeight, numericWeight];
