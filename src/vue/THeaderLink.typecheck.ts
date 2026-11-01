import { THeaderLink, type THeaderLinkProps } from 'tokiwagi-ui/vue';

const props: THeaderLinkProps = { href: '/settings', tone: 'blue', 'aria-current': 'page',
  onClick: event => { const target: EventTarget | null = event.currentTarget; void target; } };
const inferred: InstanceType<typeof THeaderLink>['$props'] = props;
// @ts-expect-error hrefは必須。
const missingHref: THeaderLinkProps = {};
// @ts-expect-error Vueの推論型でもhrefは必須。
const missingInferredHref: InstanceType<typeof THeaderLink>['$props'] = {};
// @ts-expect-error toneは定義済みの8種類。
const invalidTone: THeaderLinkProps = { href: '/', tone: 'red' };
// @ts-expect-error 現在地はaria-currentで指定する。
const invalidSelected: THeaderLinkProps = { href: '/', selected: true };
// @ts-expect-error 無効リンクは提供しない。
const invalidDisabled: THeaderLinkProps = { href: '/', disabled: true };
// @ts-expect-error フォーム送信用属性は受け取らない。
const invalidForm: THeaderLinkProps = { href: '/', formaction: '/submit' };
void [inferred, missingHref, missingInferredHref, invalidTone, invalidSelected, invalidDisabled, invalidForm];
