import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { TSidebarLayout, TSidebar, TSidebarMain, TSidebarHeader, TSidebarBody, TSidebarFooter,
  type TSidebarProps, type TSidebarLayoutProps, type TSidebarMainProps } from 'tokiwagi-ui/react';
import { act } from './test-act';
import 'tokiwagi-ui/sidebar.css';

let window: Window;
let hydrateRoot: typeof import('react-dom/client')['hydrateRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(async () => {
  window = new Window();
  for (const [key, value] of Object.entries({ window, document: window.document, navigator: window.navigator,
    HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ hydrateRoot } = await import('react-dom/client'));
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  }
});

// 右だけ・両側・中央だけの合成で要素、標準属性、設定と任意の内容が保持されることを確認する。
test('Reactのサイドバーは左右の独立設定と全パーツの属性を描画する', () => {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<TSidebarLayout gap={0} animationDuration={0} id="layout" className="custom" style={{ maxWidth: 1000 }}>
    <TSidebar side="left" aria-label="目次"><TSidebarHeader title="見出し">目次</TSidebarHeader><TSidebarBody><a href="#content">本文へ</a></TSidebarBody></TSidebar>
    <TSidebarMain as="main" id="content" data-content="main">{'<script>文字列</script>'}</TSidebarMain>
    <TSidebar side="right" as="div" open={false} width={240} id="right" aria-label="補足" aria-hidden={false}>
      <TSidebarFooter data-footer="true"><button type="button">利用側の操作</button></TSidebarFooter>
    </TSidebar>
  </TSidebarLayout>);
  expect(host.querySelector('#layout')?.className).toBe('tkw-sidebar-layout custom');
  expect(host.querySelector<HTMLElement>('#layout')?.style.maxWidth).toBe('1000px');
  expect(host.querySelector<HTMLElement>('#layout')?.style.getPropertyValue('--tkw-sidebar-gap')).toBe('0px');
  expect(host.querySelector<HTMLElement>('#layout')?.style.getPropertyValue('--tkw-sidebar-duration')).toBe('0ms');
  expect(host.querySelector('aside')?.dataset.open).toBe('true');
  expect(host.querySelector('aside')?.hasAttribute('inert')).toBe(false);
  expect(host.querySelector<HTMLElement>('#right')?.style.getPropertyValue('--tkw-sidebar-width')).toBe('240px');
  expect(host.querySelector('#right')?.getAttribute('aria-hidden')).toBe('true');
  expect(host.querySelector('#right')?.hasAttribute('inert')).toBe(true);
  expect(host.querySelector('.tkw-sidebar-header')?.getAttribute('title')).toBe('見出し');
  expect(host.querySelector('.tkw-sidebar-body a')?.getAttribute('href')).toBe('#content');
  expect(host.querySelector('.tkw-sidebar-footer')?.getAttribute('data-footer')).toBe('true');
  expect(host.querySelector('main')?.textContent).toBe('<script>文字列</script>');
  expect(host.querySelector('script')).toBeNull();
  expect(renderToStaticMarkup(<TSidebarLayout><TSidebarMain /></TSidebarLayout>)).toContain('--tkw-sidebar-gap:24px');
  expect(renderToStaticMarkup(<TSidebarLayout><TSidebarMain /><TSidebar side="right" /></TSidebarLayout>)).toContain('--tkw-sidebar-width:280px');
});

// JS経由の負数・非有限数・不正な型を拒否し、0を許可する設定と正数だけのwidthを区別する。
test('Reactのサイドバーは設定の境界と不正な値を検証する', () => {
  for (const name of ['gap', 'animationDuration'] as const) {
    for (const value of [-1, NaN, Infinity, null, '24'])
      expect(() => renderToStaticMarkup(<TSidebarLayout {...{ [name]: value } as TSidebarLayoutProps}><TSidebarMain /></TSidebarLayout>)).toThrow(name);
  }
  for (const value of [0, -1, NaN, Infinity, null, '280'])
    expect(() => renderToStaticMarkup(<TSidebar {...{ side: 'left', width: value } as TSidebarProps} />)).toThrow('width');
  for (const [name, value] of [['side', 'top'], ['as', 'nav'], ['open', 'false'], ['open', null]] as const)
    expect(() => renderToStaticMarkup(<TSidebar {...{ side: 'left', [name]: value } as TSidebarProps} />)).toThrow(name);
  expect(() => renderToStaticMarkup(<TSidebarMain as={'article' as TSidebarMainProps['as']} />)).toThrow('as');
});

// 重複・並び順・中央の欠落を拒否し、条件付きの省略とFragmentによる構成を許可する。
test('ReactのサイドバーレイアウトはDOM順と個数を検証する', () => {
  for (const children of [<TSidebar side="left" />, <><TSidebarMain /><TSidebarMain /></>,
    <><TSidebar side="left" /><TSidebar side="left" /><TSidebarMain /></>,
    <><TSidebar side="right" /><TSidebarMain /></>, <div>別のラッパー</div>])
    expect(() => renderToStaticMarkup(<TSidebarLayout>{children}</TSidebarLayout>)).toThrow('TSidebarLayout');
  expect(() => renderToStaticMarkup(<TSidebarLayout>{false}<><TSidebarMain /><TSidebar side="right" /></></TSidebarLayout>)).not.toThrow();
});

// SSRで片側を閉じた状態からhydrateし、両側を交互に切り替えてもDOM・内容・利用側イベントを維持する。
test('Reactのサイドバーは警告なくhydrateし左右を独立して更新する', async () => {
  const clicked: string[] = [];
  const page = (left = false, right = true) => <TSidebarLayout>
    <TSidebar side="left" id="left" open={left} aria-label="目次"><TSidebarBody onClick={() => clicked.push('body')}><a href="/guide" onClick={event => { event.preventDefault(); clicked.push('link'); }}>ガイド</a></TSidebarBody></TSidebar>
    <TSidebarMain><input defaultValue="保持する入力" /></TSidebarMain>
    <TSidebar side="right" id="right" open={right} aria-label="補足"><TSidebarFooter onClick={() => clicked.push('footer')}>補足</TSidebarFooter></TSidebar>
  </TSidebarLayout>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const left = host.querySelector('#left')!; const right = host.querySelector('#right')!; const input = host.querySelector('input')!;
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const recovered: unknown[] = []; let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    input.value = '編集内容';
    for (const [leftOpen, rightOpen] of [[true, true], [true, false], [false, false], [false, true], [true, false]]) {
      await act(async () => { root!.render(page(leftOpen, rightOpen)); });
      expect(host.querySelector('#left')).toBe(left); expect(host.querySelector('#right')).toBe(right);
      expect(left.hasAttribute('inert')).toBe(!leftOpen); expect(right.hasAttribute('inert')).toBe(!rightOpen);
      expect(left.getAttribute('aria-hidden')).toBe(leftOpen ? null : 'true');
      expect(host.querySelector('input')).toBe(input); expect(input.value).toBe('編集内容');
    }
    await act(async () => { host.querySelector('a')!.click(); });
    expect(clicked).toEqual(['link', 'body']);
    expect(recovered).toEqual([]); expect(errors).not.toHaveBeenCalled();
  } finally { if (root) await act(async () => { root!.unmount(); }); errors.mockRestore(); host.remove(); }
});
