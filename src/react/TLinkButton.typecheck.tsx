import { TLinkButton, type TLinkButtonProps, type LinkTone } from 'tokiwagi-ui/react';

const tone: LinkTone = 'blue';
const props: TLinkButtonProps = { href: '/calendar', tone, size: 'md', leadingIcon: 'calendar', trailingIcon: 'arrow-top-right', target: '_blank', rel: 'external', 'aria-current': 'page' };
// @ts-expect-error hrefは必須。
const missing: TLinkButtonProps = {};
// @ts-expect-error 定義済みの色だけを受け付ける。
const invalidTone: TLinkButtonProps = { href: '/', tone: 'red' };
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon: TLinkButtonProps = { href: '/', trailingIcon: 'missing' };
// @ts-expect-error リンクはdisabledを提供しない。
const disabled: TLinkButtonProps = { href: '/', disabled: true };
const link = <TLinkButton {...props} onClick={event => event.currentTarget.focus()}>予定</TLinkButton>;
void link;
void [props, missing, invalidTone, invalidIcon, disabled];

// @ts-expect-error 定義されていないサイズは指定できない。
const invalidSize: TLinkButtonProps = { href: '/', size: 'xl' };
void invalidSize;
// @ts-expect-error ボタン型リンクはinheritを提供しない。
const inheritedSize: TLinkButtonProps = { href: '/', size: 'inherit' };
void inheritedSize;
