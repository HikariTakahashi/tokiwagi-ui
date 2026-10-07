import type { ComponentProps } from 'astro/types';
import { TIcon, type TIconProps } from 'tokiwagi-ui/astro';

// check時に公開入口とAstroテンプレートのprops型の一致、不正入力の拒否を確認する。
const valid: TIconProps = { name: 'moon', size: 20, color: 'currentColor', class: 'icon' };
const props: ComponentProps<typeof TIcon> = valid;
// @ts-expect-error 未収録の公開名は使用できない。
const invalidName: ComponentProps<typeof TIcon> = { name: 'not-an-icon' };
// @ts-expect-error 対応する4サイズ以外は使用できない。
const invalidSize: ComponentProps<typeof TIcon> = { name: 'bell', size: 18 };
// @ts-expect-error 公開名は必須。
const missingName: TIconProps = {};
// @ts-expect-error classは文字列のみ。
const invalidClass: TIconProps = { name: 'bell', class: ['icon'] };
// @ts-expect-error サイズと形状はコンポーネントが固定する。
const invalidWidth: ComponentProps<typeof TIcon> = { name: 'bell', width: 99 };
// @ts-expect-error 読み上げ属性はコンポーネントが固定する。
const invalidAria: TIconProps = { name: 'bell', 'aria-hidden': false };
// @ts-expect-error 操作は親のbutton/linkが担う。
const invalidClick: TIconProps = { name: 'bell', onclick: 'alert(1)' };
void [props, invalidName, invalidSize, missingName, invalidClass, invalidWidth, invalidAria, invalidClick];
