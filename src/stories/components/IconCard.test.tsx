import { afterAll, beforeAll, expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { act, type ReactNode } from 'react';
import { readFileSync } from 'node:fs';
import { IconCard } from './IconCard';
import type { IconSearchEntry } from '../../lib/icon-assets';

let window: Window;
let createRoot: typeof import('react-dom/client')['createRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();
const observers: { callback: (entries: { isIntersecting: boolean }[]) => void; disconnected: boolean }[] = [];
beforeAll(async () => {
  window = new Window();
  class Observer {
    state: typeof observers[number];
    constructor(callback: typeof observers[number]['callback']) {
      this.state = { callback, disconnected: false };
      observers.push(this.state);
    }
    observe() {}
    disconnect() { this.state.disconnected = true; }
  }
  for (const [key, value] of Object.entries({ window, document: window.document, navigator: window.navigator,
    HTMLElement: window.HTMLElement, Node: window.Node, IntersectionObserver: Observer, IS_REACT_ACT_ENVIRONMENT: true })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ createRoot } = await import('react-dom/client'));
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

async function mount(element: ReactNode) {
  const host = document.createElement('ul');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(element));
  return { host,
    render: async (next: ReactNode) => { await act(async () => root.render(next)); },
    close: async () => { await act(async () => root.unmount()); host.remove(); },
  };
}

const icon: IconSearchEntry = { name: 'moon', category: 'basic', href: '?path=/docs/icons-moon--docs', searchLabels: [] };
const svg = readFileSync(new URL('../../../icons/moon/moon.svg', import.meta.url), 'utf8');

// 画面外では取得せず、接近後に原本を表示する。サイズ・色変更で再取得せず、クリッピングIDを分離する。
test('表示対象になったカードだけを取得し、表示設定と個別ページへのリンクを保持する', async () => {
  let calls = 0;
  const load = async () => { calls++; return svg; };
  const view = await mount(<><IconCard icon={icon} size={32} style={{ color: 'red' }} load={load} />
    <IconCard icon={icon} size={32} style={{ color: 'red' }} load={load} /></>);
  const first = observers.at(-2)!;
  const second = observers.at(-1)!;
  try {
    expect(calls).toBe(0);
    await act(async () => first.callback([{ isIntersecting: false }]));
    expect(calls).toBe(0);
    await act(async () => first.callback([{ isIntersecting: true }]));
    expect(calls).toBe(1);
    expect(first.disconnected).toBe(true);
    expect(view.host.querySelectorAll('svg')).toHaveLength(1);
    await act(async () => second.callback([{ isIntersecting: true }]));
    const ids = [...view.host.querySelectorAll('[id]')].map(element => element.id);
    expect(new Set(ids).size).toBe(2);
    await view.render(<><IconCard icon={icon} size={16} style={{ color: 'blue' }} load={load} />
      <IconCard icon={icon} size={16} style={{ color: 'blue' }} load={load} /></>);
    expect(calls).toBe(2);
    expect(view.host.querySelector('svg')!.getAttribute('width')).toBe('16');
    expect(view.host.querySelector<HTMLElement>('.tkw-icon-swatch')!.style.color).toBe('blue');
    expect(view.host.querySelector('a')!.getAttribute('href')).toBe('./?path=/docs/icons-moon--docs');
    expect(view.host.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  } finally { await view.close(); }
  expect(second.disconnected).toBe(true);
});

// エラーを表示して独立したボタンで再試行でき、リンク内にボタンを入れずに図柄を復旧する。
test('読み込み失敗を通知して再試行できる', async () => {
  let calls = 0;
  const load = async () => { if (++calls === 1) throw new Error('通信失敗'); return svg; };
  const view = await mount(<IconCard icon={icon} size={24} style={{}} load={load} />);
  try {
    await act(async () => observers.at(-1)!.callback([{ isIntersecting: true }]));
    expect(view.host.querySelector('[role=alert]')!.textContent).toContain('moonの画像を読み込めませんでした');
    expect(view.host.querySelector('a button')).toBeNull();
    await act(async () => view.host.querySelector('button')!.click());
    expect(calls).toBe(2);
    expect(view.host.querySelector('[role=alert]')).toBeNull();
    expect(view.host.querySelector('svg')!.getAttribute('width')).toBe('24');
  } finally { await view.close(); }
});

// 検索でカードが消えた後の遅い取得結果は反映せず、監視とReact更新を残さない。
test('取得途中に非表示になったカードの後着結果を無視する', async () => {
  let complete!: (value: string) => void;
  const load = () => new Promise<string>(resolve => { complete = resolve; });
  const view = await mount(<IconCard icon={icon} size={32} style={{}} load={load} />);
  await act(async () => observers.at(-1)!.callback([{ isIntersecting: true }]));
  await view.close();
  await act(async () => complete(svg));
  expect(view.host.querySelector('svg')).toBeNull();
  expect(observers.at(-1)!.disconnected).toBe(true);
});
