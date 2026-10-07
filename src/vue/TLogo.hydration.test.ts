import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TLogo, type LogoSize } from 'tokiwagi-ui/vue';

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

// VueのSSR HTMLをhydrateし、原本src・DOMを保ったままサイズと読み上げ状態を更新する。
test('VueのTLogoはハイドレーションとprops更新で画像を維持し、警告が起きない', async () => {
  const size = ref<LogoSize>(32);
  const decorative = ref(false);
  const page = { render: () => h('div', [
    h(TLogo, { size: size.value, decorative: decorative.value }), h(TLogo, { size: 128, decorative: true }),
  ]) };
  const container = document.createElement('div');
  container.innerHTML = await renderToString(createSSRApp(page));
  document.body.append(container);
  const images = [...container.querySelectorAll('img')];
  const src = images[0]!.getAttribute('src');
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const app = createSSRApp(page);
  try {
    app.mount(container);
    expect([...container.querySelectorAll('img')]).toEqual(images);
    size.value = 64;
    decorative.value = true;
    await nextTick();
    expect([...container.querySelectorAll('img')]).toEqual(images);
    expect(images[0]!.getAttribute('width')).toBe('64');
    expect(images[0]!.getAttribute('alt')).toBe('');
    expect(images[0]!.parentElement!.style.padding).toBe('16px');
    expect(images[0]!.getAttribute('src')).toBe(src);
    expect(warnings).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
  } finally {
    app.unmount();
    warnings.mockRestore();
    errors.mockRestore();
    container.remove();
  }
});
