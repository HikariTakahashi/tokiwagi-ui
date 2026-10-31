import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { THeader, THeaderSection, THeaderButton, THeaderButtonGroup, headerTones, type HeaderSectionPosition } from 'tokiwagi-ui/vue';

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

// Vueのセクションと既定slot、ネイティブ属性、全toneを公開入口のSSRで確認する。
test('Vueヘッダーは3セクションと操作属性を保持する', async () => {
  const html = await renderToString(createSSRApp({ render: () => h(THeader, { id: 'header', class: ['custom'], scrollLabel: '操作' }, () => [
    h(THeaderSection, { position: 'left' }, () => h('a', { href: '/' }, 'ホーム')),
    h(THeaderSection, { position: 'center' }, () => h(THeaderButton, { iconOnly: true, 'aria-label': 'メニュー', 'aria-expanded': false, 'aria-controls': 'menu' }, () => '図柄')),
    h(THeaderSection, { position: 'right' }, () => h(THeaderButtonGroup, { 'aria-label': '表示形式' }, () => h(THeaderButton, { selected: true }, () => '月'))),
  ]) }));
  const host = document.createElement('div'); host.innerHTML = html;
  expect(host.querySelector('header')?.className).toBe('tkw-header custom');
  expect(host.querySelector('[data-position="left"] a')?.getAttribute('href')).toBe('/');
  expect(host.querySelector('[role="region"]')?.getAttribute('tabindex')).toBe('0');
  expect(host.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('操作');
  expect(host.querySelector('[data-position="center"] button')?.hasAttribute('aria-pressed')).toBe(false);
  expect(host.querySelector('[aria-controls="menu"]')?.getAttribute('aria-expanded')).toBe('false');
  expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('表示形式');
  for (const tone of headerTones) {
    const button = await renderToString(createSSRApp({ render: () => h(THeaderButton, { tone, selected: false }, () => '月') }));
    expect(button).toContain(`data-tone="${tone}"`); expect(button).toContain('aria-pressed="false"');
  }
});

// SSR出力をhydrateしてクリックを通知し、更新後も同じDOMを保ち無効時に操作を抑止する。
test('Vueヘッダーはhydrateと外部状態更新に対応し、無効ボタンから通知しない', async () => {
  let clicks = 0;
  const selected = ref(false); const disabled = ref(false); const position = ref<HeaderSectionPosition>('center');
  const page = { render: () => h(THeader, {}, { default: () => h(THeaderSection, { position: position.value }, () => h(THeaderButton, {
    selected: selected.value, disabled: disabled.value, onClick: () => { clicks++; },
  }, () => '月')) }) };
  const host = document.createElement('div'); host.innerHTML = await renderToString(createSSRApp(page)); document.body.append(host);
  const button = host.querySelector('button')!;
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const app = createSSRApp(page);
  try {
    app.mount(host); button.click();
    expect(clicks).toBe(1); expect(button.getAttribute('aria-pressed')).toBe('false');
    const section = host.querySelector('.tkw-header-section');
    selected.value = true; position.value = 'right'; await nextTick();
    expect(host.querySelector('.tkw-header-section')).toBe(section);
    expect(section?.getAttribute('data-position')).toBe('right');
    expect(host.querySelector('button')).toBe(button); expect(button.getAttribute('aria-pressed')).toBe('true');
    disabled.value = true; await nextTick(); button.click();
    expect(button.disabled).toBe(true); expect(clicks).toBe(1);
    expect(warnings).not.toHaveBeenCalled(); expect(errors).not.toHaveBeenCalled();
  } finally { app.unmount(); warnings.mockRestore(); errors.mockRestore(); host.remove(); }
});

// 子セクションだけを残し、全配置・属性・操作通知をSSRで確認する。不正な配置は描画を拒否する。
test('VueのTHeaderSectionは全配置・領域の省略に対応し、不正なpositionを拒否する', async () => {
  const positions = ['left', 'center', 'right'] as const;
  for (let mask = 0; mask < 8; mask++) {
    const selected = positions.filter((_, i) => mask & (1 << i));
    const html = await renderToString(createSSRApp({ render: () => h(THeader, {}, () => selected.map(position =>
      h(THeaderSection, { position, id: position, class: 'custom', 'data-region': position }, () => position))) }));
    const host = document.createElement('div'); host.innerHTML = html;
    expect([...host.querySelectorAll('.tkw-header-section')].map(el => el.getAttribute('data-position'))).toEqual(selected);
    expect(host.querySelector('.tkw-header__content')?.children.length).toBe(selected.length);
    expect([...host.querySelectorAll('.tkw-header-section')].every(el => el.classList.contains('custom') && el.id === el.getAttribute('data-region'))).toBe(true);
  }
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  try {
    for (const position of [undefined, null, '', 'start', 'unknown', 1]) {
      const error = await renderToString(createSSRApp({ render: () => h(THeaderSection, { position: position as HeaderSectionPosition }) })).catch((error: Error) => error.message);
      expect(error).toContain('left/center/right');
    }
  } finally { warnings.mockRestore(); }
});
