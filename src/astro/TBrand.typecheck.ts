import type { ComponentProps } from 'astro/types';
import { TBrand, type TBrandProps } from 'tokiwagi-ui/astro';

// 公開propsとAstroテンプレートの型を照合する。
const props: TBrandProps = { text: 'TokiWa Calendar', size: 64, class: 'brand' };
const componentProps: ComponentProps<typeof TBrand> = props;
const defaults: ComponentProps<typeof TBrand> = {};
// @ts-expect-error テキストは文字列だけを受け取る。
const invalidText: TBrandProps = { text: 123 };
// @ts-expect-error 非対応サイズは受け取らない。
const invalidSize: ComponentProps<typeof TBrand> = { size: 24 };
// @ts-expect-error 名称の指定はtextを使う。
const invalidName: TBrandProps = { name: '別名称' };
// @ts-expect-error 内部ロゴは常に装飾。
const invalidDecorative: TBrandProps = { decorative: false };
// @ts-expect-error 公開APIに操作イベントはない。
const invalidClick: TBrandProps = { onclick: '操作' };
// @ts-expect-error 内部余白は固定。
const invalidStyle: TBrandProps = { style: 'padding:0' };
// @ts-expect-error Astroのclassは文字列。
const invalidClass: TBrandProps = { class: ['brand'] };
void [componentProps, defaults, invalidText, invalidSize, invalidName, invalidDecorative, invalidClick, invalidStyle, invalidClass];
