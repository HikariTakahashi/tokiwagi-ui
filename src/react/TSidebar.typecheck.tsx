import { TSidebarLayout, TSidebar, TSidebarMain, TSidebarHeader, TSidebarBody, TSidebarFooter,
  type TSidebarLayoutProps, type TSidebarProps, type TSidebarMainProps } from 'tokiwagi-ui/react';
const layout: TSidebarLayoutProps = { gap: 0, animationDuration: 0, 'data-test': 'layout' };
const sidebar: TSidebarProps = { side: 'right', open: false, width: 240, as: 'div', 'aria-label': '補足' };
const main: TSidebarMainProps = { as: 'main', id: 'content' };
const example = <TSidebarLayout {...layout} onClick={event => event.currentTarget.focus()}>
  <TSidebarMain {...main}>本文</TSidebarMain>
  <TSidebar {...sidebar}><TSidebarHeader>見出し</TSidebarHeader><TSidebarBody>情報</TSidebarBody><TSidebarFooter>補足</TSidebarFooter></TSidebar>
</TSidebarLayout>;
// @ts-expect-error sideは必須。
const missing: TSidebarProps = {};
// @ts-expect-error 左右だけを配置する。
const side: TSidebarProps = { side: 'top' };
// @ts-expect-error widthの単位はpxの数値。
const width: TSidebarProps = { side: 'left', width: '20rem' };
// @ts-expect-error 開閉はbooleanで管理する。
const open: TSidebarProps = { side: 'left', open: 'false' };
// @ts-expect-error サイドバーは操作要素にしない。
const tag: TSidebarProps = { side: 'left', as: 'button' };
// @ts-expect-error 中央領域はdiv/main。
const mainTag: TSidebarMainProps = { as: 'aside' };
void [layout, sidebar, main, example, missing, side, width, open, tag, mainTag];
