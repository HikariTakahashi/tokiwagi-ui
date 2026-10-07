import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TBrand, type LogoSize } from 'tokiwagi-ui/vue';

let window: Window;
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(() => {
  window = new Window();
  for (const [key, value] of Object.entries({
    window, document: window.document, HTMLElement: window.HTMLElement,
    Element: window.Element, SVGElement: window.SVGElement, Node: window.Node,
  })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

// VueのSSR出力をhydrateし、サイズ更新後も同じ画像・名称DOMを維持し、追加イベントを転送しない。
test('VueのTBrandは警告なくhydrateと更新を行い、クリックは親リンクが担当する', async () => {
  const size = ref<LogoSize>(32);
  let parentClicks = 0;
  let brandClicks = 0;
  const page = { render: () => h('a', { href: '/', 'aria-label': 'Tokiwagi UI ホーム', onClick: (event: Event) => { event.preventDefault(); parentClicks++; } }, [
    h(TBrand, { size: size.value, onClick: () => { brandClicks++; }, tabindex: 0, 'aria-label': '上書き' }, { default: () => '別名称' }),
    h(TBrand, { size: 128 }),
  ]) };
  const container = document.createElement('div');
  container.innerHTML = await renderToString(createSSRApp(page));
  document.body.append(container);
  const images = [...container.querySelectorAll('img')];
  const name = images[0]!.parentElement!.nextElementSibling;
  const src = images[0]!.getAttribute('src');
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const app = createSSRApp(page);
  try {
    app.mount(container);
    expect([...container.querySelectorAll('img')]).toEqual(images);
    size.value = 64;
    await nextTick();
    expect([...container.querySelectorAll('img')]).toEqual(images);
    expect(images[0]!.parentElement!.nextElementSibling).toBe(name);
    expect(images[0]!.getAttribute('width')).toBe('64');
    expect(images[0]!.getAttribute('alt')).toBe('');
    expect(images[0]!.parentElement!.style.padding).toBe('16px');
    expect(images[0]!.getAttribute('src')).toBe(src);
    expect(container.textContent).toBe('Tokiwagi UITokiwagi UI');
    expect(container.querySelector('[tabindex]')).toBeNull();
    images[0]!.click();
    expect(parentClicks).toBe(1);
    expect(brandClicks).toBe(0);
    expect(warnings).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
  } finally {
    app.unmount(); warnings.mockRestore(); errors.mockRestore(); container.remove();
  }
});
