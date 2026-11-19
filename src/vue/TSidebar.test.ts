import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref, Fragment, createCommentVNode } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TSidebarLayout, TSidebar, TSidebarMain, TSidebarHeader, TSidebarBody, TSidebarFooter } from 'tokiwagi-ui/vue';

let window: Window;
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(() => {
  window = new Window();
  for (const [key, value] of Object.entries({ window, document: window.document, HTMLElement: window.HTMLElement,
    Element: window.Element, SVGElement: window.SVGElement, Node: window.Node })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  }
});

// SSRの既定値・全パーツ・標準属性と閉鎖属性を確認し、slotの文字列をHTMLとして解釈しない。
test('Vueのサイドバーは全パーツと既定値、独立した左右の設定を保持する', async () => {
  const host = document.createElement('div');
  host.innerHTML = await renderToString(createSSRApp({ render: () => h(TSidebarLayout, {
    gap: 0, animationDuration: 0, class: 'custom', style: { maxWidth: '1000px' }, 'data-layout': 'example',
  }, () => [
    h(TSidebar, { side: 'left', 'aria-label': '目次' }, () => [
      h(TSidebarHeader, { title: '見出し' }, () => '目次'),
      h(TSidebarBody, null, () => '<script>文字列</script>'),
    ]),
    h(TSidebarMain, { as: 'main', id: 'main' }, () => '本文'),
    h(TSidebar, { side: 'right', as: 'div', open: false, width: 240, 'aria-hidden': false }, () =>
      h(TSidebarFooter, { 'data-footer': 'yes' }, () => h('a', { href: '/guide' }, 'ガイド'))),
  ]) }));
  const layout = host.firstElementChild as HTMLElement;
  expect(layout.className).toBe('tkw-sidebar-layout custom'); expect(layout.style.maxWidth).toBe('1000px');
  expect(layout.style.getPropertyValue('--tkw-sidebar-gap')).toBe('0px');
  expect(layout.style.getPropertyValue('--tkw-sidebar-duration')).toBe('0ms');
  const left = host.querySelector<HTMLElement>('[data-side="left"]')!;
  const right = host.querySelector<HTMLElement>('[data-side="right"]')!;
  expect(left.dataset.open).toBe('true'); expect(left.hasAttribute('inert')).toBe(false);
  expect(left.style.getPropertyValue('--tkw-sidebar-width')).toBe('280px');
  expect(right.tagName).toBe('DIV'); expect(right.dataset.open).toBe('false'); expect(right.hasAttribute('inert')).toBe(true);
  expect(right.getAttribute('aria-hidden')).toBe('true'); expect(right.style.getPropertyValue('--tkw-sidebar-width')).toBe('240px');
  expect(host.querySelector('.tkw-sidebar-header')?.getAttribute('title')).toBe('見出し');
  expect(host.querySelector('.tkw-sidebar-footer')?.getAttribute('data-footer')).toBe('yes');
  expect(host.querySelector('a')?.getAttribute('href')).toBe('/guide'); expect(host.querySelector('script')).toBeNull();
  expect(left.textContent).toContain('<script>文字列</script>'); expect(host.querySelector('main')?.id).toBe('main');
});

// Vue固有のFragment・v-if用コメントを扱い、中央の欠落・重複・順序と不正propsを拒否する。
test('VueのサイドバーはFragmentと省略を許可し、不正な構成と設定を拒否する', async () => {
  const render = (children: () => ReturnType<typeof h>[]) => renderToString(createSSRApp({ render: () => h(TSidebarLayout, null, children) }));
  const warn = spyOn(console, 'warn').mockImplementation(() => {});
  try {
    expect(await render(() => [createCommentVNode('省略'), h(Fragment, [h(TSidebarMain), h(TSidebar, { side: 'right' })])])).toContain('data-side="right"');
    for (const children of [() => [], () => [h(TSidebarMain), h(TSidebarMain)],
      () => [h(TSidebar, { side: 'right' }), h(TSidebarMain)], () => [h('div', '別のラッパー')]])
      expect(await render(children).catch((error: Error) => error.message)).toContain('TSidebarLayout');
    for (const [key, value] of [['width', 0], ['width', Infinity], ['open', null], ['as', 'nav'], ['side', 'top']] as const)
      expect(await renderToString(createSSRApp({ render: () => h(TSidebar, { side: 'left', [key]: value } as never) })).catch((error: Error) => error.message)).toContain(key);
    for (const key of ['gap', 'animationDuration'])
      expect(await renderToString(createSSRApp({ render: () => h(TSidebarLayout, { [key]: -1 }, () => h(TSidebarMain)) })).catch((error: Error) => error.message)).toContain(key);
  } finally { warn.mockRestore(); }
});

// 左右のSSR状態からhydrateし、開閉でDOMと入力を保ち、利用側イベントが動作することを確認する。
test('Vueのサイドバーは警告なくhydrateし、左右の開閉とslotの入力を保持する', async () => {
  const leftOpen = ref(false); const rightOpen = ref(true); let clicks = 0;
  const page = { render: () => h(TSidebarLayout, null, () => [
    h(TSidebar, { side: 'left', open: leftOpen.value, id: 'left' }, () =>
      h(TSidebarBody, { onClick: () => { clicks++; } }, () => h('a', { href: '/guide', onClick: (event: Event) => event.preventDefault() }, 'ガイド'))),
    h(TSidebarMain, null, () => h('input', { 'aria-label': '保持する入力' })),
    h(TSidebar, { side: 'right', open: rightOpen.value, id: 'right' }, () => '補足'),
  ]) };
  const host = document.createElement('div'); host.innerHTML = await renderToString(createSSRApp(page)); document.body.append(host);
  const left = host.querySelector('#left')!; const right = host.querySelector('#right')!; const input = host.querySelector('input')!;
  const warn = spyOn(console, 'warn').mockImplementation(() => {}); const error = spyOn(console, 'error').mockImplementation(() => {});
  const app = createSSRApp(page);
  try {
    app.mount(host); input.value = '編集内容';
    for (const [leftValue, rightValue] of [[true, true], [true, false], [false, false], [false, true], [true, false]]) {
      leftOpen.value = leftValue!; rightOpen.value = rightValue!; await nextTick();
      expect(host.querySelector('#left')).toBe(left); expect(host.querySelector('#right')).toBe(right);
      expect(left.hasAttribute('inert')).toBe(!leftValue); expect(right.hasAttribute('inert')).toBe(!rightValue);
      expect(host.querySelector('input')).toBe(input); expect(input.value).toBe('編集内容');
    }
    host.querySelector('a')!.click(); expect(clicks).toBe(1);
    expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
  } finally { app.unmount(); warn.mockRestore(); error.mockRestore(); host.remove(); }
});
