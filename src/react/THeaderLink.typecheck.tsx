import { THeaderLink, type THeaderLinkProps } from 'tokiwagi-ui/react';

const props: THeaderLinkProps = { href: '/settings', tone: 'blue', 'aria-current': 'page',
  onClick: event => { const link: HTMLAnchorElement = event.currentTarget; link.focus(); } };
const link = <THeaderLink {...props}>設定</THeaderLink>;
// @ts-expect-error hrefは必須。
const missingHref = <THeaderLink>設定</THeaderLink>;
// @ts-expect-error toneは定義済みの8種類。
const invalidTone = <THeaderLink href="/" tone="red" />;
// @ts-expect-error 現在地はaria-currentで指定する。
const invalidSelected = <THeaderLink href="/" selected />;
// @ts-expect-error 無効リンクは提供しない。
const invalidDisabled = <THeaderLink href="/" disabled />;
// @ts-expect-error フォーム送信用属性は受け取らない。
const invalidForm = <THeaderLink href="/" formAction="/submit" />;
void [link, missingHref, invalidTone, invalidSelected, invalidDisabled, invalidForm];
