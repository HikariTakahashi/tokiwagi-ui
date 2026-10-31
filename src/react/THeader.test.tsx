import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { act } from './test-act';
import { THeader, THeaderSection, THeaderButton, THeaderButtonGroup, headerTones, type THeaderButtonProps, type THeaderSectionProps, type HeaderSectionPosition } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/header.css';

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

// 公開入口の4部品を組み立て、属性・3領域・操作名と通常ボタンの意味をSSRでも保持する。
test('Reactヘッダーは3領域とネイティブ属性を保持し、通常の操作をトグルにしない', () => {
  const html = renderToStaticMarkup(<THeader id="app-header" className="custom" scrollLabel="予定の操作">
    <THeaderSection position="left"><a href="/">ホーム</a></THeaderSection>
    <THeaderSection position="center"><THeaderButton iconOnly aria-label="メニュー" aria-expanded={false} aria-controls="menu">図柄</THeaderButton></THeaderSection>
    <THeaderSection position="right"><THeaderButtonGroup aria-label="期間"><THeaderButton data-action="today">今日</THeaderButton></THeaderButtonGroup></THeaderSection>
  </THeader>);
  const host = document.createElement('div'); host.innerHTML = html;
  expect(host.querySelector('header')?.className).toBe('tkw-header custom');
  expect(host.querySelector('header')?.id).toBe('app-header');
  expect(host.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('予定の操作');
  expect(host.querySelector('[role="region"]')?.getAttribute('tabindex')).toBe('0');
  expect(host.querySelector('[data-position="left"] a')?.getAttribute('href')).toBe('/');
  expect(host.querySelector('[data-position="right"] [role="group"]')?.getAttribute('aria-label')).toBe('期間');
  const button = host.querySelector('button')!;
  expect(button.getAttribute('type')).toBe('button');
  expect(button.hasAttribute('aria-pressed')).toBe(false);
  expect(button.getAttribute('aria-controls')).toBe('menu');
  expect(button.getAttribute('aria-expanded')).toBe('false');
  expect(host.querySelector('[data-action="today"]')?.textContent).toBe('今日');
});

// 全toneを利用でき、型を迂回した無効設定を同じ日本語エラーで拒否する。
test('Reactヘッダーボタンは全toneと選択状態に対応し、不正な設定を拒否する', () => {
  for (const tone of headerTones) {
    const html = renderToStaticMarkup(<THeaderButton tone={tone} selected={false}>月</THeaderButton>);
    expect(html).toContain(`data-tone="${tone}"`);
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('data-selected');
  }
  for (const props of [{ tone: 'unknown' }, { type: 'link' }, { iconOnly: 'yes' }, { selected: null }, { disabled: 1 }]) {
    expect(() => renderToStaticMarkup(<THeaderButton {...props as THeaderButtonProps}>操作</THeaderButton>)).toThrow();
  }
});

// SSRの同一DOMをhydrateし、クリック通知と外部からの状態変更、無効時の抑止を検証する。
test('Reactヘッダーはhydrate後にクリックを通知し、選択は外部更新だけで変わる', async () => {
  let clicks = 0;
  const page = (selected = false, disabled = false) => <THeader>
    <THeaderSection position="left">ブランド</THeaderSection>
    <THeaderSection position="center"><THeaderButton onClick={() => { clicks++; }} selected={selected} disabled={disabled}>月</THeaderButton></THeaderSection>
    <THeaderSection position="right">右側</THeaderSection>
  </THeader>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const button = host.querySelector('button')!;
  const recovered: unknown[] = [];
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    await act(async () => { button.click(); });
    expect(clicks).toBe(1); expect(button.getAttribute('aria-pressed')).toBe('false');
    await act(async () => { root!.render(page(true)); });
    expect(host.querySelector('button')).toBe(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    await act(async () => { root!.render(page(true, true)); });
    await act(async () => { button.click(); });
    expect(clicks).toBe(1);
    expect(button.disabled).toBe(true);
    expect(recovered).toEqual([]); expect(errors).not.toHaveBeenCalled();
  } finally { if (root) await act(async () => { root!.unmount(); }); errors.mockRestore(); host.remove(); }
});

// 各領域を省略しても、指定した子だけを描画しDOM順と属性を保持する。positionの必須条件も実行時に検証する。
test('ReactのTHeaderSectionは領域の省略とネイティブ属性に対応する', () => {
  const positions = ['left', 'center', 'right'] as const;
  for (let mask = 0; mask < 8; mask++) {
    const selected = positions.filter((_, i) => mask & (1 << i));
    const host = document.createElement('div');
    host.innerHTML = renderToStaticMarkup(<THeader>{selected.map(position =>
      <THeaderSection key={position} position={position} id={position} className="custom" data-region={position}>{position}</THeaderSection>
    )}</THeader>);
    expect([...host.querySelectorAll('.tkw-header-section')].map(el => el.getAttribute('data-position'))).toEqual(selected);
    expect(host.querySelector('.tkw-header__content')?.children.length).toBe(selected.length);
    expect([...host.querySelectorAll('.tkw-header-section')].every(el => el.classList.contains('custom'))).toBe(true);
    expect(host.textContent).toBe(selected.join(''));
  }
  for (const position of [undefined, null, '', 'start', 'end', 'unknown', 1]) {
    expect(() => renderToStaticMarkup(<THeaderSection {...{ position } as THeaderSectionProps}>内容</THeaderSection>)).toThrow('left/center/right');
  }
});

// セクションの配置更新でもSSRの同じDOMを維持し、子のイベントは利用側へ通知する。
test('ReactのTHeaderSectionはhydrate後に配置を更新できる', async () => {
  let clicks = 0;
  const page = (position: HeaderSectionPosition) => <THeader><THeaderSection position={position} onClick={() => { clicks++; }}>
    <THeaderButton>操作</THeaderButton>
  </THeaderSection></THeader>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page('center')); document.body.append(host);
  const section = host.querySelector('.tkw-header-section')!;
  const button = host.querySelector('button')!;
  const recovered: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(host, page('center'), { onRecoverableError: error => recovered.push(error) }); });
    await act(async () => { root!.render(page('right')); });
    expect(host.querySelector('.tkw-header-section')).toBe(section);
    expect(section.getAttribute('data-position')).toBe('right');
    await act(async () => { button.click(); });
    expect(clicks).toBe(1); expect(recovered).toEqual([]);
  } finally { if (root) await act(async () => { root!.unmount(); }); host.remove(); }
});
