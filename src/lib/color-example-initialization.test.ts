import { afterEach, expect, mock, test } from 'bun:test';
import { Window } from 'happy-dom';
import { initializeColorExamples } from './color-example-initialization';

const originalObserver = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver');
afterEach(() => {
  if (originalObserver) Object.defineProperty(globalThis, 'IntersectionObserver', originalObserver);
  else Reflect.deleteProperty(globalThis, 'IntersectionObserver');
});

function fixture() {
  const window = new Window();
  window.document.body.innerHTML = '<section><button>コピー</button></section><section><button>コピー</button></section>';
  const panels = Array.from(window.document.querySelectorAll('section')) as unknown as HTMLElement[];
  const observe = mock(() => {});
  const unobserve = mock(() => {});
  let notify: IntersectionObserverCallback;
  class Observer {
    constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
      notify = callback;
      expect(options.rootMargin).toBe('200px 0px');
    }
    observe = observe;
    unobserve = unobserve;
  }
  Object.defineProperty(globalThis, 'IntersectionObserver', { configurable: true, value: Observer });
  const enter = (panel: HTMLElement, isIntersecting = true) => notify([
    { target: panel, isIntersecting } as unknown as IntersectionObserverEntry,
  ], {} as IntersectionObserver);
  return { window, panels, observe, unobserve, enter };
}

// 画面外では重い処理を呼ばず、表示領域に近づいたパネルだけを一度初期化する。
test('画面外の見本を初期化せず表示直前に一度だけ初期化する', () => {
  const { panels, observe, unobserve, enter } = fixture();
  const setup = mock(() => {});
  initializeColorExamples(panels, setup);
  expect(setup).not.toHaveBeenCalled();
  expect(observe).toHaveBeenCalledTimes(2);
  enter(panels[0]!, false);
  expect(setup).not.toHaveBeenCalled();
  enter(panels[0]!);
  enter(panels[0]!);
  expect(setup).toHaveBeenCalledTimes(1);
  expect(setup).toHaveBeenLastCalledWith(panels[0]);
  expect(unobserve).toHaveBeenCalledWith(panels[0]);
});

// Observerの通知前でもフォーカスや最初のクリックを取りこぼさず、その後の通知で再初期化しない。
test('フォーカスとポインター操作は表示通知を待たずに見本を準備する', () => {
  const { window, panels, enter } = fixture();
  const setup = mock(() => {});
  initializeColorExamples(panels, setup);
  panels[0]!.querySelector('button')!.focus();
  panels[1]!.querySelector('button')!.dispatchEvent(new window.Event('pointerdown', { bubbles: true }) as unknown as Event);
  expect(setup).toHaveBeenCalledTimes(2);
  for (const panel of panels) enter(panel);
  expect(setup).toHaveBeenCalledTimes(2);
});

// ページ復元などで既にパネル内にフォーカスがある場合も、操作可能な状態で開始する。
test('開始時にフォーカスされている見本はすぐ初期化する', () => {
  const { panels } = fixture();
  panels[0]!.querySelector('button')!.focus();
  const setup = mock(() => {});
  initializeColorExamples(panels, setup);
  expect(setup).toHaveBeenCalledTimes(1);
  expect(setup).toHaveBeenCalledWith(panels[0]);
});

// IntersectionObserverが利用できない環境では全見本を準備し、コピーや編集を利用できる状態にする。
test('表示監視がない環境では全見本を初期化する', () => {
  const { panels } = fixture();
  Reflect.deleteProperty(globalThis, 'IntersectionObserver');
  const setup = mock(() => {});
  initializeColorExamples(panels, setup);
  expect(setup).toHaveBeenCalledTimes(2);
});
