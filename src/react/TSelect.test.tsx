import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString } from 'react-dom/server';
import { TSelect, type SelectOption } from 'tokiwagi-ui/react';
import { act } from './test-act';

const options: SelectOption[] = [{ value: 'button', label: 'ボタン' }, { value: 'label', label: '<ラベル>' }, { value: 'card', label: 'カード', disabled: true }];
let browser: Window;
let hydrateRoot: typeof import('react-dom/client')['hydrateRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(async () => {
  browser = new Window();
  for (const [key, value] of Object.entries({ window: browser, document: browser.document, navigator: browser.navigator,
    HTMLElement: browser.HTMLElement, SVGElement: browser.SVGElement, Node: browser.Node, IS_REACT_ACT_ENVIRONMENT: true })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ hydrateRoot } = await import('react-dom/client'));
});
afterAll(async () => {
  await browser.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

// SSRとhydrateでID・DOM・初期値を保ち、説明・エラーとネイティブ変更イベントを入力へ接続する。
test('ReactのTSelectはSSR後もラベル・値・フォーム属性とイベントを保持する', async () => {
  const changes: string[] = [];
  const page = (value = 'button', disabled = false) => <div><TSelect options={options} value={value} onChange={event => changes.push(event.currentTarget.value)}
    label="見本" description="表示する部品" error="選び直してください" name="example" form="editor" required disabled={disabled}
    className="example" data-purpose="preview" aria-describedby="external" /><TSelect options={options} aria-label="別の見本" /></div>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const input = host.querySelector('select')!;
  const ids = [...host.querySelectorAll('[id]')].map(node => node.id);
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const recovered: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    expect(new Set(ids).size).toBe(ids.length);
    expect(host.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(`external ${input.id}-description ${input.id}-error`);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.name).toBe('example'); expect(input.getAttribute('form')).toBe('editor'); expect(input.required).toBe(true);
    expect(input.className).toBe('tkw-select__input example'); expect(input.dataset.purpose).toBe('preview');
    expect(input.options[2]!.disabled).toBe(true); expect(input.options[1]!.textContent).toBe('<ラベル>');
    expect(host.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    expect(host.querySelector('select')).toBe(input); expect(input.value).toBe('button');
    await act(async () => { input.value = 'label'; input.dispatchEvent(new browser.Event('change', { bubbles: true }) as unknown as Event); });
    expect(changes).toEqual(['label']);
    await act(async () => root!.render(page('label', true)));
    expect(input.value).toBe('label'); expect(input.disabled).toBe(true); expect(input.multiple).toBe(false);
    expect(recovered).toEqual([]); expect(errors).not.toHaveBeenCalled();
  } finally { if (root) await act(async () => root!.unmount()); errors.mockRestore(); host.remove(); }
});

// 初期値をoptionの標準selectedとして出力し、ブラウザーのフォームリセットの基点を作る。
test('ReactのTSelectは未選択とdefaultValueを静的出力に保持する', () => {
  const host = document.createElement('div');
  host.innerHTML = renderToString(<TSelect options={options} placeholder="選択してください" defaultValue="" required aria-label="見本" />);
  const input = host.querySelector('select')!;
  expect(input.value).toBe(''); expect(input.options[0]!.hasAttribute('selected')).toBe(true);
  expect(input.options[0]!.disabled).toBe(false); expect(input.checkValidity()).toBe(false);
  host.innerHTML = renderToString(<TSelect options={options} defaultValue="label" aria-label="見本" />);
  expect(host.querySelector('option[selected]')!.getAttribute('value')).toBe('label');
});
