import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { TBrand, type TBrandProps, type LogoSize } from 'tokiwagi-ui/react';

let window: Window;
let hydrateRoot: typeof import('react-dom/client')['hydrateRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();

beforeAll(async () => {
  window = new Window();
  const values = {
    window, document: window.document, navigator: window.navigator,
    HTMLElement: window.HTMLElement, SVGElement: window.SVGElement, Node: window.Node,
    MutationObserver: window.MutationObserver, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const [key, value] of Object.entries(values)) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ hydrateRoot } = await import('react-dom/client'));
});

afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

// SSR出力をhydrateし、サイズ更新後も名称・画像DOMを維持する。余分なイベントは転送せず親リンクだけが動作する。
test('TBrandは警告なくhydrateと更新を行い、クリックは親リンクが担当する', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  let parentClicks = 0;
  let brandClicks = 0;
  const extra = { onClick: () => { brandClicks++; }, tabIndex: 0, 'aria-label': '上書き', children: '別名称' };
  const page = (size: LogoSize) => <a href="/" aria-label="Tokiwagi UI ホーム" onClick={event => { event.preventDefault(); parentClicks++; }}>
    <TBrand {...extra as TBrandProps} size={size} /><TBrand size={128} />
  </a>;
  container.innerHTML = renderToString(page(32));
  const images = [...container.querySelectorAll('img')];
  const name = images[0]!.parentElement!.nextElementSibling;
  const src = images[0]!.getAttribute('src');
  const recovered: unknown[] = [];
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(container, page(32), { onRecoverableError: error => recovered.push(error) }); });
    expect([...container.querySelectorAll('img')]).toEqual(images);
    await act(async () => { root!.render(page(64)); });
    expect([...container.querySelectorAll('img')]).toEqual(images);
    expect(images[0]!.parentElement!.nextElementSibling).toBe(name);
    expect(images[0]!.getAttribute('width')).toBe('64');
    expect(images[0]!.parentElement!.style.padding).toBe('16px');
    expect(images[0]!.getAttribute('src')).toBe(src);
    expect(images.every(image => image.getAttribute('alt') === '')).toBe(true);
    expect(container.textContent).toBe('Tokiwagi UITokiwagi UI');
    expect(container.querySelectorAll('a')).toHaveLength(1);
    expect(container.querySelector('[tabindex]')).toBeNull();
    await act(async () => { images[0]!.click(); });
    expect(parentClicks).toBe(1);
    expect(brandClicks).toBe(0);
    expect(recovered).toHaveLength(0);
    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => { root!.unmount(); });
    errors.mockRestore(); warnings.mockRestore(); container.remove();
  }
});
