import { TButton, type TButtonProps, type ButtonTone } from 'tokiwagi-ui/react';

const tone: ButtonTone = 'blue';
const props: TButtonProps = { tone, leadingIcon: 'save', type: 'submit', disabled: false,
  form: 'editor', className: 'save', onClick: event => event.currentTarget.focus() };
const button = <TButton {...props} data-action="save">保存する</TButton>;
// @ts-expect-error 定義済みの色だけを受け付ける。
const invalidTone = <TButton tone="red" />;
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon = <TButton leadingIcon="missing-icon" />;
// @ts-expect-error 無効状態にはbooleanを指定する。
const invalidDisabled = <TButton disabled="false" />;
void [button, invalidTone, invalidIcon, invalidDisabled];
