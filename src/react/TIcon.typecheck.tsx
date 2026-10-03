import type { ComponentProps } from 'react';
import { TIcon, type TIconProps } from 'tokiwagi-ui/react';

// check時に公開入口とJSXのpropsを検査する。誤った値が受理されるとexpect-errorが失敗する。
const valid: TIconProps = { name: 'moon', size: 20, color: 'currentColor', className: 'icon' };
const props: ComponentProps<typeof TIcon> = valid;
const element = <TIcon {...valid} />;
// @ts-expect-error 未収録の公開名は使用できない。
const invalidName = <TIcon name="not-an-icon" />;
// @ts-expect-error 対応する4サイズ以外は使用できない。
const invalidSize = <TIcon name="bell" size={18} />;
// @ts-expect-error 公開名は必須。
const missingName = <TIcon />;
// @ts-expect-error スタイルは公開しない。
const invalidStyle = <TIcon name="bell" style={{ width: 99 }} />;
// @ts-expect-error 操作は親のbutton/linkが担う。
const invalidClick = <TIcon name="bell" onClick={() => {}} />;
// @ts-expect-error SVG内に利用側のchildrenを挿入しない。
const invalidChildren = <TIcon name="bell">通知</TIcon>;
// @ts-expect-error refは公開しない。
const invalidRef = <TIcon name="bell" ref={() => {}} />;
// @ts-expect-error classNameはReactの文字列形式のみ。
const invalidClass = <TIcon name="bell" className={['icon']} />;
void [props, element, invalidName, invalidSize, missingName, invalidStyle, invalidClick, invalidChildren, invalidRef, invalidClass];
