import { TLogo, type TLogoProps } from 'tokiwagi-ui/vue';

// 公開propsとVueのコンポーネント型の一致を検査する。
const props: TLogoProps = { size: 64, decorative: true, class: ['brand-logo', { active: true }] };
const componentProps: InstanceType<typeof TLogo>['$props'] = props;
const defaults: InstanceType<typeof TLogo>['$props'] = {};
// @ts-expect-error 最小32pxと許可サイズを守る。
const invalidSize: TLogoProps = { size: 24 };
// @ts-expect-error 固定配色を変更しない。
const invalidColor: TLogoProps = { color: 'red' };
// @ts-expect-error decorativeはboolean。
const invalidDecorative: InstanceType<typeof TLogo>['$props'] = { decorative: 'true' };
void [componentProps, defaults, invalidSize, invalidColor, invalidDecorative];
