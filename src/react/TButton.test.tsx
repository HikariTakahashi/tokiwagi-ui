import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString } from 'react-dom/server';
import { TButton } from 'tokiwagi-ui/react';
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
