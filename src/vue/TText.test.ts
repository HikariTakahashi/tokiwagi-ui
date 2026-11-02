import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TText, type TextOptions } from 'tokiwagi-ui/vue';
import { invalidTextOptions } from '../lib/text-test-helpers';

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

// slotの強調・リンクと標準属性を保持し、HTML風文字列や空文字もそのまま扱う。
test('VueのTTextはslot・属性・スタイルを保持し、文字列をHTMLとして解釈しない', async () => {
  const render = (options: Record<string, unknown> = {}, content = '<img src=x> & 日本語') => renderToString(createSSRApp({
    render: () => h(TText, options, () => [h('strong', '重要'), h('a', { href: '#details' }, '詳細'), content]),
  }));
  const host = document.createElement('div');
  host.innerHTML = await render({ as: 'p', id: 'description', class: 'custom', title: '補足', 'aria-live': 'polite',
    'data-test': 'text', style: { maxWidth: '320px' } });
  const node = host.firstElementChild as HTMLElement;
  expect(node.tagName).toBe('P'); expect(node.className).toBe('tkw-text custom'); expect(node.id).toBe('description');
  expect(node.style.maxWidth).toBe('320px'); expect(node.getAttribute('aria-live')).toBe('polite');
  expect(node.dataset.test).toBe('text'); expect(node.querySelector('strong')?.textContent).toBe('重要');
  expect(node.querySelector('a')?.getAttribute('href')).toBe('#details'); expect(node.querySelector('img')).toBeNull();
  expect(node.textContent).toContain('<img src=x> & 日本語');
  expect(await render({}, '')).not.toContain('undefined');
  const warn = spyOn(console, 'warn').mockImplementation(() => {});
  try {
    for (const [name, value] of invalidTextOptions) {
      const error = await render({ [name]: value }).catch((error: Error) => error.message);
      expect(error).toContain(name);
    }
    const error = await render({ truncate: true, lineClamp: 2 }).catch((error: Error) => error.message);
    expect(error).toContain('同時');
  } finally { warn.mockRestore(); }
});

// 同じSSR要素をhydrateし、props更新時の省略解除・レスポンシブ設定・イベントを検証する。
test('VueのTTextは警告なくhydrateし、設定と本文とネイティブイベントを更新する', async () => {
  const options = ref<TextOptions>({ as: 'p', inherit: true, lineClamp: 2, tone: 'inherit' });
  const text = ref('今日\nの予定'); const clicked: EventTarget[] = [];
  const page = { render: () => h(TText, { ...options.value, onClick: (event: Event) => clicked.push(event.currentTarget!) }, () => text.value) };
  const host = document.createElement('div'); host.innerHTML = await renderToString(createSSRApp(page)); document.body.append(host);
  const node = host.firstElementChild as HTMLElement;
  const warn = spyOn(console, 'warn').mockImplementation(() => {}); const error = spyOn(console, 'error').mockImplementation(() => {});
  const app = createSSRApp(page);
  try {
    app.mount(host); expect(host.firstElementChild).toBe(node); node.click(); expect(clicked).toEqual([node]);
    options.value = { as: 'p', size: { base: 'sm', lg: 'lg' }, weight: 'bold', tone: 'error', truncate: true, italic: true };
    text.value = '保存に失敗しました'; await nextTick();
    expect(host.firstElementChild).toBe(node); expect(node.textContent).toBe(text.value);
    expect(node.hasAttribute('data-line-clamp')).toBe(false); expect(node.style.getPropertyValue('--tkw-text-line-clamp')).toBe('');
    expect(node.hasAttribute('data-truncate')).toBe(true); expect(node.hasAttribute('data-inherit')).toBe(false);
    expect(node.dataset.tone).toBe('error'); expect(node.style.getPropertyValue('--tkw-text-size-lg')).toBe('1.125rem');
    expect(node.style.getPropertyValue('--tkw-text-weight')).toBe('700');
    expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
  } finally { app.unmount(); warn.mockRestore(); error.mockRestore(); host.remove(); }
});
