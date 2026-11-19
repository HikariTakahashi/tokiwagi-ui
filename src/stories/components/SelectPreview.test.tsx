import { expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from '../../react/test-act';
import { AstroSelectPreview } from './SelectPreview';

// React管理外のAstro出力でもchangeを通知し、HTML差し替えと離脱で古いイベント処理を残さない。
test('AstroのTSelect見本は値の変更を通知し古いイベントを解除する', async () => {
  const browser = new Window();
  const globals = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries({ window: browser, document: browser.document, navigator: browser.navigator,
    HTMLElement: browser.HTMLElement, SVGElement: browser.SVGElement, Node: browser.Node, IS_REACT_ACT_ENVIRONMENT: true })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const { createRoot } = await import('react-dom/client');
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host); const changes: string[] = [];
  const changed = (value: string) => changes.push(value);
  const html = (value: string) => `<select><option value="${value}">${value}</option></select>`;
  try {
    await act(async () => root.render(<AstroSelectPreview html={html('button')} onValueChange={changed} />));
    const first = host.querySelector('select')!;
    await act(async () => first.dispatchEvent(new browser.Event('change', { bubbles: true }) as unknown as Event));
    expect(changes).toEqual(['button']);
    await act(async () => root.render(<AstroSelectPreview html={html('label')} onValueChange={changed} />));
    first.dispatchEvent(new browser.Event('change') as unknown as Event);
    expect(changes).toEqual(['button']);
    const next = host.querySelector('select')!;
    await act(async () => next.dispatchEvent(new browser.Event('change', { bubbles: true }) as unknown as Event));
    expect(changes).toEqual(['button', 'label']);
    await act(async () => root.unmount());
    next.dispatchEvent(new browser.Event('change') as unknown as Event);
    expect(changes).toEqual(['button', 'label']);
  } finally {
    host.remove();
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    await browser.happyDOM.close();
  }
});
