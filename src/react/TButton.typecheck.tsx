import { TButton, buttonSizes, type TButtonProps, type ButtonTone, type ButtonSize, type ButtonOptions } from 'tokiwagi-ui/react';

const tone: ButtonTone = 'blue';
const size: ButtonSize = buttonSizes[0];
const options: ButtonOptions = { size, leadingIcon: 'save', trailingIcon: 'tool' };
const props: TButtonProps = { ...options, tone, type: 'submit', disabled: false,
  form: 'editor', className: 'save', onClick: event => event.currentTarget.focus() };
const button = <TButton {...props} data-action="save">保存する</TButton>;
// @ts-expect-error 定義済みの色だけを受け付ける。
const invalidTone = <TButton tone="red" />;
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon = <TButton leadingIcon="missing-icon" />;
// @ts-expect-error 無効状態にはbooleanを指定する。
const invalidDisabled = <TButton disabled="false" />;
// @ts-expect-error 末尾にも登録済みアイコンだけを指定する。
const invalidTrailingIcon = <TButton trailingIcon="missing-icon" />;
// @ts-expect-error 通常ボタンはinheritサイズを受け付けない。
const invalidSize = <TButton size="inherit" />;
void [button, invalidTone, invalidIcon, invalidDisabled, invalidTrailingIcon, invalidSize];

const neutralTones = ['neutral-0', 'neutral-600', 'neutral-800', 'neutral-900'] as const;
const neutralProps: TButtonProps[] = neutralTones.map(tone => ({ tone }));
// @ts-expect-error 無効状態用の400は通常のtoneに公開しない。
const disabledTone: TButtonProps = { tone: 'neutral-400' };
void [neutralProps, disabledTone];
