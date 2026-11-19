import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString } from 'react-dom/server';
import { TLink } from 'tokiwagi-ui/react';
import { act } from './test-act';
import 'tokiwagi-ui/link.css';

let window: Window;
let hydrateRoot: typeof import('react-dom/client')['hydrateRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(async () => {
  window = new Window();
  for (const [key, value] of Object.entries({ window, document: window.document, navigator: window.navigator,
    HTMLElement: window.HTMLElement, SVGElement: window.SVGElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })) {
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

// SSRのリンクと両アイコンをhydrate後に再利用し、ネイティブイベント・属性・現在地の更新を確認する。
test('ReactのTLinkはネイティブリンクと装飾アイコンをSSR後も保持する', async () => {
  const clicks: EventTarget[] = [];
  const prevented: boolean[] = [];
  const page = (updated = false) => <TLink href={updated ? '#next' : '/予定'} target="_blank" rel="external opener"
    size={updated ? 'lg' : 'sm'} tone="blue" leadingIcon="moon" trailingIcon={updated ? undefined : 'tool'} aria-current={updated ? 'page' : undefined}
    className="details" data-kind="event" aria-describedby="hint" onClick={event => {
      clicks.push(event.currentTarget); prevented.push(event.defaultPrevented); event.preventDefault();
    }}>{updated ? '次の予定' : <em>予定の詳細</em>}</TLink>;
  const host = document.createElement('div');
  host.innerHTML = renderToString(page());
  document.body.append(host);
  const anchor = host.querySelector('a')!;
  const icons = [...anchor.querySelectorAll('svg')];
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const recovered: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    expect(anchor.getAttribute('href')).toBe('/予定');
    expect(anchor.rel).toBe('external noopener');
    expect(anchor.className).toBe('tkw-link details');
    expect(anchor.dataset.kind).toBe('event');
    expect(anchor.getAttribute('aria-describedby')).toBe('hint');
    expect(anchor.querySelector('em')?.textContent).toBe('予定の詳細');
    const ids = [...host.querySelectorAll('[id]')].map(el => el.id);
    expect(new Set(ids).size).toBe(2);
    for (const icon of icons) {
      expect(icon.getAttribute('width')).toBe('16');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    expect(host.querySelector('a')).toBe(anchor);
    expect([...anchor.querySelectorAll('svg')]).toEqual(icons);
    await act(async () => anchor.click());
    expect(clicks).toEqual([anchor]);
    expect(prevented).toEqual([false]);
    await act(async () => root!.render(page(true)));
    expect(host.querySelector('a')).toBe(anchor);
    expect(anchor.getAttribute('href')).toBe('#next');
    expect(anchor.getAttribute('data-size')).toBe('lg');
    expect(anchor.querySelector('svg')?.getAttribute('width')).toBe('20');
    expect(anchor.querySelector('svg')).toBe(icons[0]);
    expect(anchor.getAttribute('aria-current')).toBe('page');
    expect(anchor.hasAttribute('data-current')).toBe(true);
    expect(anchor.querySelector('.tkw-link__label')?.textContent).toBe('次の予定');
    expect(anchor.querySelector('.tkw-link__trailing-icon')).toBeNull();
    expect(recovered).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root!.unmount());
    errors.mockRestore(); host.remove();
  }
});
