import type { ComponentProps } from 'react';
import { TLogo, type TLogoProps } from 'tokiwagi-ui/react';

// 公開入口の型とJSXの許可範囲を検査する。
const props: TLogoProps = { size: 64, decorative: true, className: 'brand-logo' };
const componentProps: ComponentProps<typeof TLogo> = props;
const defaults = <TLogo />;
// @ts-expect-error 最小32pxと許可サイズを守る。
const invalidSize = <TLogo size={24} />;
// @ts-expect-error 固定配色を変更しない。
const invalidColor = <TLogo color="red" />;
// @ts-expect-error 代替テキストはブランド名とdecorativeから決める。
const invalidAlt = <TLogo alt="別の名前" />;
// @ts-expect-error 操作は親リンクが担う。
const invalidHref = <TLogo href="/" />;
// @ts-expect-error decorativeはboolean。
const invalidDecorative = <TLogo decorative="true" />;
// @ts-expect-error childrenは受け取らない。
const invalidChildren = <TLogo>名称</TLogo>;
// @ts-expect-error 内部のサイズ・余白は変更しない。
const invalidStyle = <TLogo style={{ padding: 0 }} />;
void [componentProps, defaults, invalidSize, invalidColor, invalidAlt, invalidHref, invalidDecorative, invalidChildren, invalidStyle];
