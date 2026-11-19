import { TLinkButton, type TLinkButtonProps, type LinkTone } from 'tokiwagi-ui/vue';

const tone: LinkTone = 'blue';
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
const inferred: InstanceType<typeof TLinkButton>['$props'] = props;
// @ts-expect-error Vueの推論型でもhrefは必須。
const missingInferred: InstanceType<typeof TLinkButton>['$props'] = {};
void [inferred, missingInferred];
void [props, missing, invalidTone, invalidIcon, disabled];

// @ts-expect-error 定義されていないサイズは指定できない。
const invalidSize: TLinkButtonProps = { href: '/', size: 'xl' };
void invalidSize;
// @ts-expect-error ボタン型リンクはinheritを提供しない。
const inheritedSize: TLinkButtonProps = { href: '/', size: 'inherit' };
void inheritedSize;
// @ts-expect-error Vueの推論型でもサイズを制限する。
const invalidInferredSize: InstanceType<typeof TLinkButton>['$props'] = { href: '/', size: 'xl' };
void invalidInferredSize;

const autofocus: TLinkButtonProps = { href: '/', autofocus: true };
const inferredAutofocus: InstanceType<typeof TLinkButton>['$props'] = { href: '/', autofocus: true, disabled: true };
// @ts-expect-error Vueの推論型でも無効状態はbooleanに限る。
const invalidInferredDisabled: InstanceType<typeof TLinkButton>['$props'] = { href: '/', disabled: 'true' };
void [autofocus, inferredAutofocus, invalidInferredDisabled];
