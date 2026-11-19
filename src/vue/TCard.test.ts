import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref, useId } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TCard, TCardHeader, TCardTitle, TCardDescription, TCardBody, TCardFooter, TCardMedia, TCardActionArea } from 'tokiwagi-ui/vue';
import { invalidCardOptions } from '../lib/card-test-helpers';

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

// slotと属性をネイティブ要素に保持し、全パーツと画像・見出しの意味を検証する。
test('VueのTCardは全パーツとslotと標準属性を保持する', async () => {
  const host = document.createElement('div');
  host.innerHTML = await renderToString(createSSRApp({ render: () => h(TCard, {
    as: 'article', variant: 'subtle', size: 'sm', class: 'custom', 'aria-labelledby': 'example-title', 'aria-busy': true, style: { maxWidth: '414px' },
  }, () => [
    h(TCardMedia, { class: 'cover' }, () => h('img', { src: '/cover.png', alt: 'カードの設計図' })),
    h(TCardHeader, { title: '見出し' }, () => [h(TCardTitle, { as: 'h2', id: 'example-title' }, () => '設計'), h(TCardDescription, null, () => '補足')]),
    h(TCardBody, null, () => ['<script>実行しない</script>', h('strong', '重要')]),
    h(TCardFooter, null, () => h('button', { type: 'button' }, '保存')),
  ]) }));
  const card = host.firstElementChild as HTMLElement;
  expect(card.tagName).toBe('ARTICLE'); expect(card.className).toBe('tkw-card custom');
  expect(card.dataset.variant).toBe('subtle'); expect(card.dataset.size).toBe('sm');
  expect(card.getAttribute('aria-busy')).toBe('true'); expect(card.style.maxWidth).toBe('414px');
  expect(card.querySelector('h2')?.id).toBe('example-title'); expect(card.querySelector('img')?.getAttribute('alt')).toBe('カードの設計図');
  expect(card.querySelector('.tkw-card-header')?.getAttribute('title')).toBe('見出し');
  expect(card.querySelector('.tkw-card-description')?.tagName).toBe('P');
  expect(card.querySelector('strong')?.textContent).toBe('重要'); expect(card.querySelector('.tkw-card-footer button')).not.toBeNull();
  expect(card.querySelector('script')).toBeNull(); expect(card.textContent).toContain('<script>実行しない</script>');
  const warn = spyOn(console, 'warn').mockImplementation(() => {});
  try {
    for (const [key, value] of invalidCardOptions) {
      const error = await renderToString(createSSRApp({ render: () => h(TCard, { [key]: value }) })).catch((error: Error) => error.message);
      expect(error).toContain(key);
    }
    const error = await renderToString(createSSRApp({ render: () => h(TCardActionArea, { href: '' }) })).catch((error: Error) => error.message);
    expect(error).toContain('href');
  } finally { warn.mockRestore(); }
});

// SSRから同じノードを再利用し、propsとslotとイベント更新が警告なく動くことを確認する。
test('VueのTCardは複数表示をhydrateし、設定とリンク操作を更新する', async () => {
  const updated = ref(false); const clicked: EventTarget[] = [];
  const Example = { setup() {
    const id = useId();
    return () => h(TCard, { as: 'article', variant: updated.value ? 'elevated' : 'outline', size: updated.value ? 'lg' : 'md', 'aria-labelledby': id }, () =>
      h(TCardActionArea, { href: updated.value ? '/new' : '/guide', target: '_blank', rel: 'external opener',
        onClick: (event: Event) => { event.preventDefault(); clicked.push(event.currentTarget!); } }, () => [
        h(TCardHeader, null, () => h(TCardTitle, { id }, () => updated.value ? '更新' : '導入')), h(TCardBody, null, () => '本文'),
      ]));
  } };
  const page = { render: () => h('div', [h(Example), h(Example)]) };
  const host = document.createElement('div'); host.innerHTML = await renderToString(createSSRApp(page)); document.body.append(host);
  const card = host.querySelector('article')!; const link = card.querySelector('a')!;
  const ids = [...host.querySelectorAll('h3')].map(node => node.id); expect(new Set(ids).size).toBe(2);
  const warn = spyOn(console, 'warn').mockImplementation(() => {}); const error = spyOn(console, 'error').mockImplementation(() => {});
  const app = createSSRApp(page);
  try {
    app.mount(host); link.click(); expect(clicked).toEqual([link]);
    updated.value = true; await nextTick();
    expect(host.querySelector('article')).toBe(card); expect(card.dataset.variant).toBe('elevated'); expect(card.dataset.size).toBe('lg');
    expect(link.getAttribute('href')).toBe('/new'); expect(link.rel).toBe('external noopener');
    expect(card.querySelector('h3')?.id).toBe(ids[0]); expect(card.querySelector('h3')?.textContent).toBe('更新');
    expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
  } finally { app.unmount(); warn.mockRestore(); error.mockRestore(); host.remove(); }
});
