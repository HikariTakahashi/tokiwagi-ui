import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { TText, type TTextProps } from 'tokiwagi-ui/react';
import { invalidTextOptions } from '../lib/text-test-helpers';
import { act } from './test-act';
import 'tokiwagi-ui/text.css';

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
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  }
});

// 公開入口の実コンポーネントで、空文字・混在内容・安全な文字表示と標準属性を検証する。
test('ReactのTTextは内容・属性・スタイルを保持し、文字列をHTMLとして解釈しない', () => {
  const html = renderToStaticMarkup(<TText as="p" id="description" title="補足" className="custom"
    data-test="text" aria-live="polite" style={{ maxWidth: 320 }}>
    今日の予定 <strong>重要</strong><a href="#details">詳細</a>{'<img src=x> & 日本語'}
  </TText>);
  const host = document.createElement('div'); host.innerHTML = html;
  const node = host.firstElementChild as HTMLElement;
  expect(node.tagName).toBe('P'); expect(node.id).toBe('description');
  expect(node.className).toBe('tkw-text custom'); expect(node.style.maxWidth).toBe('320px');
  expect(node.getAttribute('aria-live')).toBe('polite'); expect(node.dataset.test).toBe('text');
  expect(node.querySelector('strong')?.textContent).toBe('重要');
  expect(node.querySelector('a')?.getAttribute('href')).toBe('#details');
  expect(node.querySelector('img')).toBeNull(); expect(node.textContent).toContain('<img src=x> & 日本語');
  expect(renderToStaticMarkup(<TText />)).toContain('<span');
  expect(renderToStaticMarkup(<TText>{''}</TText>)).not.toContain('undefined');
  for (const [name, value] of invalidTextOptions)
    expect(() => renderToStaticMarkup(<TText {...{ [name]: value } as TTextProps} />)).toThrow(name);
  expect(() => renderToStaticMarkup(<TText truncate lineClamp={2} />)).toThrow('同時');
});

// SSRの要素を再利用し、設定変更時のスタイル・省略解除・イベント・本文更新を検証する。
test('ReactのTTextは警告なくhydrateし、設定と本文とネイティブイベントを更新する', async () => {
  const clicked: EventTarget[] = [];
  const page = (updated = false) => <TText as="p" size={updated ? { base: 'sm', lg: 'lg' } : undefined}
    inherit={!updated} weight={updated ? 'bold' : undefined} tone={updated ? 'error' : 'inherit'}
    lineClamp={updated ? undefined : 2} truncate={updated} whiteSpace="pre-wrap" italic={updated}
    onClick={event => clicked.push(event.currentTarget)}>{updated ? '保存に失敗しました' : '今日\nの予定'}</TText>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const node = host.firstElementChild as HTMLElement;
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const recovered: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    await act(async () => { node.click(); }); expect(clicked).toEqual([node]);
    await act(async () => { root!.render(page(true)); });
    expect(host.firstElementChild).toBe(node); expect(node.textContent).toBe('保存に失敗しました');
    expect(node.hasAttribute('data-inherit')).toBe(false); expect(node.hasAttribute('data-line-clamp')).toBe(false);
    expect(node.style.getPropertyValue('--tkw-text-line-clamp')).toBe('');
    expect(node.hasAttribute('data-truncate')).toBe(true); expect(node.dataset.tone).toBe('error');
    expect(node.style.getPropertyValue('--tkw-text-size-lg')).toBe('1.125rem');
    expect(node.style.getPropertyValue('--tkw-text-weight')).toBe('700');
    expect(recovered).toEqual([]); expect(errors).not.toHaveBeenCalled();
  } finally { if (root) await act(async () => { root!.unmount(); }); errors.mockRestore(); host.remove(); }
});
