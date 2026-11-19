import { h } from 'vue';
import { TSidebarLayout, TSidebar, TSidebarMain, type TSidebarProps, type TSidebarLayoutProps, type TSidebarMainProps } from 'tokiwagi-ui/vue';
const sidebar: TSidebarProps = { side: 'right', open: false, width: 240, as: 'div', 'aria-label': '補足', 'data-test': 'sidebar' };
const layout: TSidebarLayoutProps = { gap: 0, animationDuration: 0 };
const main: TSidebarMainProps = { as: 'main', id: 'main' };
// @ts-expect-error sideは必須。
const missing: TSidebarProps = {};
// @ts-expect-error 左右だけを配置する。
const side: TSidebarProps = { side: 'top' };
// @ts-expect-error 幅はpxの数値。
const width: TSidebarProps = { side: 'left', width: '20rem' };
// @ts-expect-error 開閉はboolean。
const open: TSidebarProps = { side: 'left', open: 'false' };
// @ts-expect-error サイドバーはaside/div。
const tag: TSidebarProps = { side: 'left', as: 'nav' };
// @ts-expect-error 中央はdiv/main。
const mainTag: TSidebarMainProps = { as: 'aside' };
void [sidebar, layout, main, missing, side, width, open, tag, mainTag];
const example = h(TSidebarLayout, layout, () => [h(TSidebarMain, main), h(TSidebar, sidebar)]);
void example;
// @ts-expect-error 実コンポーネントの推論型もside必須。
const inferred: InstanceType<typeof TSidebar>['$props'] = {};
void inferred;
