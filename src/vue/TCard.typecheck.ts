import { h } from 'vue';
import { TCard, TCardTitle, TCardActionArea, type TCardProps, type TCardTitleProps, type TCardActionAreaProps } from 'tokiwagi-ui/vue';
const card: TCardProps = { as: 'article', variant: 'subtle', size: 'lg', 'aria-labelledby': 'title', 'data-example': 'card' };
const title: TCardTitleProps = { as: 'h2', id: 'title' };
const link: TCardActionAreaProps = { href: '/guide', target: '_blank', rel: 'external' };
const example = h(TCard, card, () => h(TCardActionArea, link, () => h(TCardTitle, title, () => '導入')));
void example;
// @ts-expect-error ルートは非操作要素に限定する。
const root: TCardProps = { as: 'button' };
// @ts-expect-error 定義済みの外観だけを受け付ける。
const variant: TCardProps = { variant: 'filled' };
// @ts-expect-error 定義済みの余白だけを受け付ける。
const size: TCardProps = { size: 'xl' };
// @ts-expect-error タイトルは見出し要素に限定する。
const heading: TCardTitleProps = { as: 'div' };
// @ts-expect-error リンクはhref必須。
const missing: TCardActionAreaProps = {};
// @ts-expect-error 全体リンクにdisabledは提供しない。
const disabled: TCardActionAreaProps = { href: '/', disabled: true };
void [card, title, link, root, variant, size, heading, missing, disabled];
