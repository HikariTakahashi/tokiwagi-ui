import type { THeaderLinkProps } from 'tokiwagi-ui/astro';

const props: THeaderLinkProps = { active: true, href: '/settings', tone: 'blue', 'aria-current': 'page', 'data-action': 'settings' };
// @ts-expect-error hrefは必須。
const missingHref: THeaderLinkProps = {};
// @ts-expect-error toneは定義済みの8種類。
const invalidTone: THeaderLinkProps = { href: '/', tone: 'red' };
// @ts-expect-error 現在地はaria-currentで指定する。
const invalidSelected: THeaderLinkProps = { href: '/', selected: true };
// @ts-expect-error 無効リンクは提供しない。
const invalidDisabled: THeaderLinkProps = { href: '/', disabled: true };
// @ts-expect-error フォーム送信用属性は受け取らない。
const invalidForm: THeaderLinkProps = { href: '/', formaction: '/submit' };
void [props, missingHref, invalidTone, invalidSelected, invalidDisabled, invalidForm];

// @ts-expect-error activeはbooleanだけを受け付ける。
const invalidActive: THeaderLinkProps = { href: '/', active: 'true' };
void invalidActive;
