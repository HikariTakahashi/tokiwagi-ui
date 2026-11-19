import { TLink, type TLinkProps, type LinkTone } from 'tokiwagi-ui/vue';

const tone: LinkTone = 'blue';
const props: TLinkProps = { href: '/calendar', tone, leadingIcon: 'calendar', trailingIcon: 'arrow-top-right', target: '_blank', rel: 'external', 'aria-current': 'page' };
// @ts-expect-error hrefは必須。
const missing: TLinkProps = {};
// @ts-expect-error 定義済みの色だけを受け付ける。
const invalidTone: TLinkProps = { href: '/', tone: 'red' };
// @ts-expect-error 存在するアイコン名だけを受け付ける。
const invalidIcon: TLinkProps = { href: '/', trailingIcon: 'missing' };
// @ts-expect-error リンクはdisabledを提供しない。
const disabled: TLinkProps = { href: '/', disabled: true };
const inferred: InstanceType<typeof TLink>['$props'] = props;
// @ts-expect-error Vueの推論型でもhrefは必須。
const missingInferred: InstanceType<typeof TLink>['$props'] = {};
void [inferred, missingInferred];
void [props, missing, invalidTone, invalidIcon, disabled];
