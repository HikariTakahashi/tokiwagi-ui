import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString } from 'react-dom/server';
import { TButton, buttonSizes } from 'tokiwagi-ui/react';
import { act } from './test-act';
import 'tokiwagi-ui/button.css';

let window: Window;
let hydrateRoot: typeof import('react-dom/client')['hydrateRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(async () => {
  window = new Window();
  for (const [key, value] of Object.entries({
    window, document: window.document, navigator: window.navigator, HTMLElement: window.HTMLElement,
    SVGElement: window.SVGElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ hydrateRoot } = await import('react-dom/client'));
});

// 全サイズと4通りの配置を同時にSSR・hydrateし、読み上げ名とクリッピングIDを分離して更新する。
test('ReactのTButtonは全サイズと前後アイコンをhydrate後も連動させる', async () => {
  const page = (updated = false) => <div>{buttonSizes.flatMap((size, index) =>
    [0, 1, 2, 3].map(placement => <TButton key={`${size}-${placement}`}
      size={updated ? buttonSizes[(index + 1) % buttonSizes.length] : size}
      leadingIcon={placement & 1 ? 'moon' : undefined} trailingIcon={placement & 2 ? 'moon' : undefined}>
      <em>保存する</em>
    </TButton>))}</div>;
  const host = document.createElement('div');
  host.innerHTML = renderToString(page()); document.body.append(host);
  const buttons = [...host.querySelectorAll('button')];
  const icons = [...host.querySelectorAll('svg')];
  const ids = [...host.querySelectorAll('[id]')].map(node => node.id);
  const recovered: unknown[] = [];
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    expect(new Set(ids).size).toBe(12);
    buttons.forEach((button, index) => {
      const placement = index % 4;
      expect(button.dataset.size).toBe(buttonSizes[Math.floor(index / 4)]);
      expect(button.querySelector('.tkw-button__label')?.textContent).toBe('保存する');
      expect(button.firstElementChild?.classList.contains('tkw-button__leading-icon')).toBe(Boolean(placement & 1));
      expect(button.lastElementChild?.classList.contains('tkw-button__trailing-icon')).toBe(Boolean(placement & 2));
      expect(button.querySelectorAll('svg').length).toBe(Number(Boolean(placement & 1)) + Number(Boolean(placement & 2)));
      for (const icon of button.querySelectorAll('svg')) {
        expect(icon.getAttribute('width')).toBe(String([20, 24, 32][Math.floor(index / 4)]));
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      }
    });
    for (const node of host.querySelectorAll('[clip-path]')) {
      expect(ids).toContain(node.getAttribute('clip-path')!.slice(5, -1));
    }
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    expect([...host.querySelectorAll('svg')]).toEqual(icons);
    await act(async () => root!.render(page(true)));
    expect([...host.querySelectorAll('button')]).toEqual(buttons);
    expect([...host.querySelectorAll('svg')]).toEqual(icons);
    buttons.forEach((button, index) => {
      const next = (Math.floor(index / 4) + 1) % 3;
      expect(button.dataset.size).toBe(buttonSizes[next]);
      for (const icon of button.querySelectorAll('svg')) expect(icon.getAttribute('width')).toBe(String([20, 24, 32][next]));
    });
    expect(recovered).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root!.unmount());
    errors.mockRestore(); host.remove();
  }
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

// SSRで作ったボタンとアイコンを再利用し、属性・イベント・無効化・文言更新を公開入口から検証する。
test('ReactのTButtonはhydrate後もネイティブ属性とイベントを保持する', async () => {
  const clicked: EventTarget[] = [];
  const page = (disabled = false) => (
    <TButton tone="blue" leadingIcon={disabled ? undefined : 'moon'} disabled={disabled}
      type="submit" form="editor" name="action" value="save" className="save" data-action="save"
      aria-describedby="hint" onClick={event => clicked.push(event.currentTarget)}>
      {disabled ? '保存中' : '保存する'}
    </TButton>
  );
  const host = document.createElement('div');
  host.innerHTML = renderToString(page());
  document.body.append(host);
  const button = host.querySelector('button')!;
  const icon = button.querySelector('svg');
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const recovered: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    expect(button.getAttribute('form')).toBe('editor');
    expect(button.type).toBe('submit');
    expect(button.className).toBe('tkw-button save');
    expect(button.dataset.action).toBe('save');
    expect(button.getAttribute('aria-describedby')).toBe('hint');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.getAttribute('width')).toBe('32');
    await act(async () => {
      root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) });
    });
    expect(host.querySelector('button')).toBe(button);
    expect(button.querySelector('svg')).toBe(icon);
    await act(async () => button.click());
    expect(clicked).toEqual([button]);
    await act(async () => { root!.render(page(true)); });
    expect(host.querySelector('button')).toBe(button);
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('保存中');
    expect(button.querySelector('.tkw-button__icon')).toBeNull();
    await act(async () => button.click());
    expect(clicked).toHaveLength(1);
    expect(recovered).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root!.unmount());
    errors.mockRestore();
    host.remove();
  }
});
