import type { ComponentProps } from 'react';
import { TBrand, type TBrandProps } from 'tokiwagi-ui/react';

// 公開入口の型とJSXが同じ静的ブランドAPIを持つことを検査する。
const props: TBrandProps = { size: 64, className: 'brand' };
const componentProps: ComponentProps<typeof TBrand> = props;
const defaults = <TBrand />;
// @ts-expect-error 許可サイズ以外は受け取らない。
const invalidSize = <TBrand size={24} />;
// @ts-expect-error 名称は固定。
const invalidName = <TBrand name="別名称" />;
// @ts-expect-error 内部ロゴは常に装飾。
const invalidDecorative = <TBrand decorative={false} />;
// @ts-expect-error childrenは受け取らない。
const invalidChildren = <TBrand>別名称</TBrand>;
// @ts-expect-error 操作は親が担う。
const invalidClick = <TBrand onClick={() => {}} />;
// @ts-expect-error リンクは親が担う。
const invalidHref = <TBrand href="/" />;
// @ts-expect-error フォーカスは親が担う。
const invalidTabIndex = <TBrand tabIndex={0} />;
// @ts-expect-error 内部余白は固定。
const invalidStyle = <TBrand style={{ padding: 0 }} />;
// @ts-expect-error DOM参照を公開しない。
const invalidRef = <TBrand ref={() => {}} />;
void [componentProps, defaults, invalidSize, invalidName, invalidDecorative, invalidChildren, invalidClick, invalidHref, invalidTabIndex, invalidStyle, invalidRef];
