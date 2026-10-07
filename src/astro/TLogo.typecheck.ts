import type { ComponentProps } from 'astro/types';
import { TLogo, type TLogoProps } from 'tokiwagi-ui/astro';

// 公開propsとAstroテンプレートの型の一致を検査する。
const props: TLogoProps = { size: 64, decorative: true, class: 'brand-logo' };
const componentProps: ComponentProps<typeof TLogo> = props;
const defaults: ComponentProps<typeof TLogo> = {};
// @ts-expect-error 最小32pxと許可サイズを守る。
const invalidSize: ComponentProps<typeof TLogo> = { size: 24 };
// @ts-expect-error 固定配色を変更しない。
const invalidColor: TLogoProps = { color: 'red' };
// @ts-expect-error 内部の余白は変更しない。
const invalidStyle: TLogoProps = { style: 'padding:0' };
// @ts-expect-error decorativeはboolean。
const invalidDecorative: TLogoProps = { decorative: 'true' };
void [componentProps, defaults, invalidSize, invalidColor, invalidStyle, invalidDecorative];
