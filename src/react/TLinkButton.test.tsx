import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString } from 'react-dom/server';
import { TButton, TLinkButton, buttonTones, textWeights, type TextWeight } from 'tokiwagi-ui/react';
import { act } from './test-act';
import 'tokiwagi-ui/link-button.css';

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

// 無効状態のSSRをhydrateし、利用側の属性・ハンドラーを抑止してから元のリンクへ復元する。
test('ReactのTLinkButtonは無効化中の操作を止めて再有効化で属性とイベントを復元する', async () => {
  let actions = 0, parentClicks = 0;
  const page = (disabled = true) => <div onClick={() => parentClicks++}>
    <TLinkButton href="#restored" disabled={disabled} target="_blank" rel="external opener" download="file"
      tabIndex={3} autoFocus contentEditable suppressContentEditableWarning accessKey="x" aria-disabled="false" role="button" data-kind="retained"
      onClick={event => { actions++; event.preventDefault(); }} onClickCapture={() => actions++} onAuxClick={() => actions++}
      onDoubleClick={() => actions++} onKeyDown={() => actions++} onPointerDown={() => actions++}>
      無効な遷移
    </TLinkButton>
  </div>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const anchor = host.querySelector('a')!;
  const recovered: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    for (const name of ['href', 'target', 'rel', 'download', 'tabindex', 'autofocus', 'contenteditable', 'accesskey', 'disabled']) expect(anchor.hasAttribute(name)).toBe(false);
    expect(anchor.getAttribute('role')).toBe('link');
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.dataset.kind).toBe('retained');
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    for (const type of ['click', 'auxclick', 'dblclick', 'pointerdown']) await act(async () => {
      anchor.dispatchEvent(new window.MouseEvent(type, { bubbles: true, cancelable: true }) as unknown as Event);
    });
    await act(async () => anchor.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }) as unknown as Event));
    expect([actions, parentClicks]).toEqual([0, 0]);
    await act(async () => root!.render(page(false)));
    expect(host.querySelector('a')).toBe(anchor);
    expect(anchor.getAttribute('href')).toBe('#restored');
    expect(anchor.rel).toBe('external noopener');
    expect(anchor.getAttribute('download')).toBe('file');
    expect(anchor.tabIndex).toBe(3);
    expect(renderToString(page(false))).toContain('autofocus=""');
    expect(anchor.hasAttribute('data-disabled')).toBe(false);
    expect(anchor.getAttribute('aria-disabled')).toBe('false');
    await act(async () => anchor.click());
    expect([actions, parentClicks]).toEqual([2, 1]);
    expect(recovered).toEqual([]);
  } finally { if (root) await act(async () => root!.unmount()); host.remove(); }
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

// 両部品を未指定・4段階でSSRし、hydrate後に明示値から継承へ戻しても同じDOMを使う。
test('Reactの両ボタンは太さを指定・変更・解除できる', async () => {
  const weights: (TextWeight | undefined)[] = [undefined, ...textWeights];
  const page = (offset = 0) => <div>{weights.map((_, index) => {
    const weight = weights[(index + offset) % weights.length];
    return <div key={index}><TButton weight={weight}>保存</TButton>
      <TLinkButton href="/calendar" weight={weight} aria-current="page">予定</TLinkButton></div>;
  })}</div>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const nodes = [...host.querySelectorAll('.tkw-button')];
  const recovered: unknown[] = [];
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  const verify = (offset: number) => nodes.forEach((node, index) => {
    expect(node.getAttribute('data-weight')).toBe(weights[(Math.floor(index / 2) + offset) % weights.length] ?? null);
    expect(node.hasAttribute('weight')).toBe(false);
  });
  try {
    verify(0);
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    for (const offset of [1, 0]) {
      await act(async () => root!.render(page(offset)));
      expect([...host.querySelectorAll('.tkw-button')]).toEqual(nodes);
      verify(offset);
    }
    expect(recovered).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root!.unmount());
    errors.mockRestore(); host.remove();
  }
});

// SSRのリンクと両アイコンをhydrate後に再利用し、ネイティブイベント・属性・現在地の更新を確認する。
test('ReactのTLinkButtonはネイティブリンクと装飾アイコンをSSR後も保持する', async () => {
  const clicks: EventTarget[] = [];
  const prevented: boolean[] = [];
  const page = (updated = false) => <TLinkButton href={updated ? '#next' : '/予定'} target="_blank" rel="external opener"
    size={updated ? 'lg' : 'sm'} tone="blue" leadingIcon="moon" trailingIcon={updated ? undefined : 'tool'} aria-current={updated ? 'page' : undefined}
    className="details" data-kind="event" aria-describedby="hint" onClick={event => {
      clicks.push(event.currentTarget); prevented.push(event.defaultPrevented); event.preventDefault();
    }}>{updated ? '次の予定' : <em>予定の詳細</em>}</TLinkButton>;
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
    expect(anchor.className).toBe('tkw-button tkw-link-button details');
    expect(anchor.dataset.kind).toBe('event');
    expect(anchor.getAttribute('aria-describedby')).toBe('hint');
    expect(anchor.querySelector('em')?.textContent).toBe('予定の詳細');
    const ids = [...host.querySelectorAll('[id]')].map(el => el.id);
    expect(new Set(ids).size).toBe(2);
    for (const icon of icons) {
      expect(icon.getAttribute('width')).toBe('20');
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
    expect(anchor.querySelector('svg')?.getAttribute('width')).toBe('32');
    expect(anchor.querySelector('svg')).toBe(icons[0]);
    expect(anchor.getAttribute('aria-current')).toBe('page');
    expect(anchor.hasAttribute('data-current')).toBe(true);
    expect(anchor.querySelector('.tkw-link-button__label')?.textContent).toBe('次の予定');
    expect(anchor.querySelector('.tkw-link-button__trailing-icon')).toBeNull();
    expect(recovered).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root!.unmount());
    errors.mockRestore(); host.remove();
  }
});

// 公開入口の全toneで両部品をSSR・hydrateし、同じDOMのまま色と無効状態を切り替える。
test('Reactの両ボタンは全toneを保持してハイドレーション後も更新できる', async () => {
  const page = (updated = false) => <div>{buttonTones.map((tone, index) => {
    const value = updated ? buttonTones[(index + 1) % buttonTones.length] : tone;
    return <div key={tone}><TButton tone={value} disabled={updated}>保存</TButton>
      <TLinkButton href="/calendar" tone={value} disabled={updated}>予定</TLinkButton></div>;
  })}</div>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const nodes = [...host.querySelectorAll('.tkw-button')];
  const recovered: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    expect(nodes.map(node => node.getAttribute('data-tone'))).toEqual(buttonTones.flatMap(tone => [tone, tone]));
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    await act(async () => root!.render(page(true)));
    expect([...host.querySelectorAll('.tkw-button')]).toEqual(nodes);
    nodes.forEach((node, index) => {
      expect(node.getAttribute('data-tone')).toBe(buttonTones[(Math.floor(index / 2) + 1) % buttonTones.length]);
      expect(node.matches(':disabled, [data-disabled]')).toBe(true);
    });
    expect(recovered).toEqual([]);
  } finally {
    if (root) await act(async () => root!.unmount());
    host.remove();
  }
});
