import { expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString } from 'react-dom/server';
import { TCheckbox } from 'tokiwagi-ui/react';
import { act } from './test-act';

// SSRから同じネイティブ入力を再利用し、ID・一部選択・変更通知・非制御の初期値を検証する。
test('ReactのTCheckboxはSSRとハイドレーション後の選択状態をつなぐ', async () => {
  const browser = new Window();
  const globals = new Map<string, PropertyDescriptor | undefined>();
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const recoveries: unknown[] = [];
  const changes: boolean[] = [];
  let root: ReturnType<typeof import('react-dom/client')['hydrateRoot']> | undefined;
  const page = (mixed = true, checked = false) => <form>
    <TCheckbox label="すべて" description="対象を表示" error="選択してください" aria-describedby="external"
      checked={checked} indeterminate={mixed} onChange={event => changes.push(event.currentTarget.checked)} />
    <TCheckbox label="個人" name="calendar" value="personal" defaultChecked />
  </form>;
  try {
    for (const [key, value] of Object.entries({
      window: browser, document: browser.document, navigator: browser.navigator,
      HTMLElement: browser.HTMLElement, Node: browser.Node, IS_REACT_ACT_ENVIRONMENT: true,
    })) {
      globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const { hydrateRoot } = await import('react-dom/client');
    const host = document.createElement('div');
    document.body.append(host);
    host.innerHTML = renderToString(page(), { identifierPrefix: 'calendars' });
    const [parent, child] = host.querySelectorAll('input');
    expect(parent!.id).not.toBe(child!.id);
    expect(host.querySelector('label')!.htmlFor).toBe(parent!.id);
    expect(parent!.getAttribute('aria-describedby')).toBe(`external ${parent!.id}-description ${parent!.id}-error`);
    expect(parent!.getAttribute('aria-invalid')).toBe('true');
    expect(parent!.dataset.tkwCheckboxMixed).toBe('true');
    expect(child!.defaultChecked).toBe(true);

    await act(async () => {
      root = hydrateRoot(host, page(), { identifierPrefix: 'calendars', onRecoverableError: error => recoveries.push(error) });
    });
    expect(host.querySelector('input')).toBe(parent!);
    expect(parent!.indeterminate).toBe(true);
    await act(async () => parent!.click());
    expect(changes).toEqual([true]);
    expect(parent!.indeterminate).toBe(true);
    await act(async () => root!.render(page(false, true)));
    expect(parent!.indeterminate).toBe(false);
    expect(parent!.checked).toBe(true);

    child!.click();
    expect(child!.checked).toBe(false);
    host.querySelector('form')!.reset();
    expect(child!.checked).toBe(true);
    expect(recoveries).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root!.unmount());
    errors.mockRestore();
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    await browser.happyDOM.close();
  }
});
