import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { act } from './test-act';
import { THeader, THeaderSection, THeaderButton, THeaderLink, TIcon, THeaderButtonGroup, headerTones, type THeaderButtonProps, type THeaderSectionProps, type HeaderSectionPosition } from 'tokiwagi-ui/react';
import 'tokiwagi-ui/header.css';

// activeのSSRとhydrate後の更新を確認し、クリックやactive変更でARIAの選択状態が変わらないことを検証する。
test('Reactヘッダーのactiveはボタンとリンクの選択状態から独立して更新できる', async () => {
  const page = (active?: boolean) => <>
    <THeaderButton active={active}>操作</THeaderButton>
    <THeaderLink href="#settings" active={active}>設定</THeaderLink>
    <THeaderButton active={active} selected>選択中</THeaderButton>
    <THeaderLink href="#calendar" active={active} aria-current="page">現在地</THeaderLink>
  </>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const nodes = [...host.children];
  const recovered: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    for (const active of [true, false, undefined]) {
      await act(async () => { root!.render(page(active)); });
      expect([...host.children]).toEqual(nodes);
      for (const node of nodes) {
        expect(node.hasAttribute('data-active')).toBe(active === true);
        expect(node.hasAttribute('active')).toBe(false);
      }
      expect(nodes[0]!.hasAttribute('aria-pressed')).toBe(false);
      expect(nodes[1]!.hasAttribute('aria-current')).toBe(false);
      expect(nodes[2]!.getAttribute('aria-pressed')).toBe('true');
      expect(nodes[3]!.getAttribute('aria-current')).toBe('page');
      expect(nodes[2]!.hasAttribute('data-selected')).toBe(true);
      expect(nodes[3]!.hasAttribute('data-selected')).toBe(true);
      await act(async () => { (nodes[0] as HTMLButtonElement).click(); });
      expect(nodes[0]!.hasAttribute('data-active')).toBe(active === true);
    }
    expect(recovered).toEqual([]);
  } finally { if (root) await act(async () => { root!.unmount(); }); host.remove(); }
  expect(() => renderToStaticMarkup(<THeaderButton active={'true' as never} />)).toThrow('active');
  expect(() => renderToStaticMarkup(<THeaderLink href="/" active={null as never} />)).toThrow('active');
});

// 公開リンクを全tone・現在地でSSRし、属性・装飾アイコン・混在グループのDOM順を保持する。
test('Reactヘッダーリンクはリンク属性と現在地を保持する', () => {
  for (const tone of headerTones) for (const current of [undefined, false, 'false', true, 'page', 'location'] as const) {
    const local = new Window();
    local.document.body.innerHTML = renderToStaticMarkup(<THeaderButtonGroup aria-label="操作と移動">
      <THeaderButton>操作</THeaderButton>
      <THeaderLink href="/settings?q=予定#top" tone={tone} aria-current={current} target="_blank" rel="external opener"
        iconOnly aria-label="設定" className="custom" id="settings" data-action="settings" title="設定へ"><TIcon name="setting" /></THeaderLink>
    </THeaderButtonGroup>);
    const link = local.document.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/settings?q=予定#top');
    expect(link.getAttribute('rel')).toBe('external noopener');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('aria-current')).toBe(current === undefined ? null : String(current));
    expect(link.hasAttribute('data-selected')).toBe(current === true || current === 'page' || current === 'location');
    expect(link.getAttribute('data-tone')).toBe(tone);
    expect(link.getAttribute('aria-label')).toBe('設定');
    expect(link.classList.contains('custom')).toBe(true);
    expect(link.getAttribute('title')).toBe('設定へ');
    expect(link.getAttribute('data-action')).toBe('settings');
    expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(link.hasAttribute('aria-pressed')).toBe(false);
    expect([...local.document.querySelector('[role="group"]')!.children].map(node => node.tagName)).toEqual(['BUTTON', 'A']);
    void local.happyDOM.close();
  }
  expect(() => renderToStaticMarkup(<THeaderLink href=" ">設定</THeaderLink>)).toThrow('href');
});

// SSRのaを再利用してhydrateし、href・現在地・target更新とリンク要素のイベント対象を確認する。
test('Reactヘッダーリンクはhydrate後もネイティブイベントと属性更新に対応する', async () => {
  const clicked: EventTarget[] = [];
  const page = (href = '/settings', current = false, target = '_blank') => <THeaderLink href={href}
    aria-current={current ? 'page' : false} target={target} rel="opener external"
    onClick={event => { event.preventDefault(); clicked.push(event.currentTarget!); }}>設定</THeaderLink>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const link = host.querySelector('a')!;
  const recovered: unknown[] = [];
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    await act(async () => { link.click(); });
    expect(clicked).toEqual([link]);
    expect(link.hasAttribute('data-selected')).toBe(false);
    await act(async () => { root!.render(page('#next', true, '_self')); });
    expect(host.querySelector('a')).toBe(link);
    expect(link.getAttribute('href')).toBe('#next');
    expect(link.getAttribute('rel')).toBe('opener external');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.hasAttribute('data-selected')).toBe(true);
    await act(async () => { root!.render(page()); });
    expect(link.hasAttribute('data-selected')).toBe(false);
    expect(link.getAttribute('rel')).toBe('external noopener');
    expect(recovered).toEqual([]); expect(errors).not.toHaveBeenCalled();
  } finally { if (root) await act(async () => { root!.unmount(); }); errors.mockRestore(); host.remove(); }
});

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
  const page = (selected = false, disabled = false, backgroundColor: HeaderBackgroundColor = '--tkw-color-neutral-0') => <THeader backgroundColor={backgroundColor}>
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
    await act(async () => { root!.render(page(true, true, '--tkw-color-secondary-navy'));});
    await act(async () => { button.click(); });
    expect(clicks).toBe(1);
    expect(host.querySelector('header')?.getAttribute('data-background')).toBe('--tkw-color-secondary-navy');
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

import { headerBackgroundColors, type HeaderBackgroundColor } from 'tokiwagi-ui/react';
// 全背景色のSSR出力で、設定と利用側styleを保持し、独自propsをHTMLへ漏らさない。
test('reactヘッダーは全93色とネイティブstyleに対応する', async () => {
  const local = new Window();
  try {
    for (const backgroundColor of [undefined, ...headerBackgroundColors]) {
      const html = renderToStaticMarkup(<THeader backgroundColor={backgroundColor} style={{ marginTop: 2 }} />);
      local.document.body.innerHTML = html;
      const header = local.document.querySelector('header')!;
      expect(header.getAttribute('data-background')).toBe(backgroundColor ?? '--tkw-color-neutral-0');
      expect(header.style.getPropertyValue('--tkw-header-background')).toBe(`var(${backgroundColor ?? '--tkw-color-neutral-0'})`);
      expect(header.style.marginTop).toBe('2px');
      expect(header.hasAttribute('backgroundcolor')).toBe(false);
    }
  } finally { await local.happyDOM.close(); }
  expect(() => renderToStaticMarkup(<THeader backgroundColor={'red' as HeaderBackgroundColor} />)).toThrow('93カラートークン');
});
