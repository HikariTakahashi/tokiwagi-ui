import { TLinkButton, type TLinkButtonProps, type ButtonTone } from 'tokiwagi-ui/react';

const tone: ButtonTone = 'neutral-600';
const props: TLinkButtonProps = { href: '/calendar', tone, size: 'md', leadingIcon: 'calendar', trailingIcon: 'arrow-top-right', target: '_blank', rel: 'external', 'aria-current': 'page' };
// @ts-expect-error hrefは必須。
const missing: TLinkButtonProps = {};
// @ts-expect-error 定義済みの色だけを受け付ける。
const invalidTone: TLinkButtonProps = { href: '/', tone: 'red' };
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon: TLinkButtonProps = { href: '/', trailingIcon: 'missing' };
const disabled: TLinkButtonProps = { href: '/', disabled: true };
// @ts-expect-error 無効状態はTButtonと同じbooleanに限る。
const invalidDisabled: TLinkButtonProps = { href: '/', disabled: 'true' };
void invalidDisabled;
const link = <TLinkButton {...props} onClick={event => event.currentTarget.focus()}>予定</TLinkButton>;
void link;
void [props, missing, invalidTone, invalidIcon, disabled];

// @ts-expect-error 定義されていないサイズは指定できない。
const invalidSize: TLinkButtonProps = { href: '/', size: 'xl' };
void invalidSize;
// @ts-expect-error ボタン型リンクはinheritを提供しない。
const inheritedSize: TLinkButtonProps = { href: '/', size: 'inherit' };
void inheritedSize;

const neutralTones = ['neutral-0', 'neutral-600', 'neutral-800', 'neutral-900'] as const;
const neutralProps: TLinkButtonProps[] = neutralTones.map(tone => ({ href: '/', tone }));
// @ts-expect-error 無効状態用の400は通常のtoneに公開しない。
const disabledTone: TLinkButtonProps = { href: '/', tone: 'neutral-400' };
void [neutralProps, disabledTone];
