import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { headerTones } from '../lib/header';

plugin({ name: 'astro-header-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { THeader, THeaderSection, THeaderButton, THeaderLink, THeaderButtonGroup, TIcon } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// activeの有無を静的HTMLへ反映し、既存の選択・現在地と独立させ、型を迂回した不正値を拒否する。
test('Astroヘッダーのactiveはボタンとリンクの選択状態から独立して出力される', async () => {
  const window = new Window();
  try {
    for (const component of [THeaderButton, THeaderLink]) for (const active of [undefined, false, true]) {
      for (const selected of [false, true]) {
        window.document.body.innerHTML = await container.renderToString(component, { props: {
          active, ...(component === THeaderButton ? { selected: selected ? true : undefined } : { href: '/', 'aria-current': selected ? 'page' : undefined }),
        } });
        const node = window.document.body.firstElementChild!;
        expect(node.hasAttribute('data-active')).toBe(active === true);
        expect(node.hasAttribute('active')).toBe(false);
        expect(node.hasAttribute('data-selected')).toBe(selected);
        expect(node.hasAttribute('aria-pressed')).toBe(component === THeaderButton && selected);
        expect(node.hasAttribute('aria-current')).toBe(component === THeaderLink && selected);
      }
      const error = await container.renderToString(component, { props: { href: '/', active: 'true' } }).catch((error: Error) => error.message);
      expect(error).toContain('activeにはboolean');
    }
  } finally { await window.happyDOM.close(); }
});

// 公開リンクを静的描画し、全tone・現在地とリンク属性、slot、混在グループを保持する。
test('Astroヘッダーリンクはリンク属性と現在地を静的HTMLへ出力する', async () => {
  const window = new Window();
  try {
    const icon = await container.renderToString(TIcon, { props: { name: 'setting' } });
    for (const tone of headerTones) for (const current of [undefined, false, 'false', true, 'page', 'location'] as const) {
      const linkHtml = await container.renderToString(THeaderLink, { props: {
        href: '/settings?q=予定#top', tone, 'aria-current': current, target: '_blank', rel: 'external opener',
        iconOnly: true, 'aria-label': '設定', class: 'custom', id: 'settings', 'data-action': 'settings', title: '設定へ',
      }, slots: { default: icon } });
      const button = await container.renderToString(THeaderButton, { slots: { default: '操作' } });
      window.document.body.innerHTML = await container.renderToString(THeaderButtonGroup, {
        props: { 'aria-label': '操作と移動' }, slots: { default: button + linkHtml },
      });
      const link = window.document.querySelector('a')!;
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
      expect([...window.document.querySelector('[role="group"]')!.children].map(node => node.tagName)).toEqual(['BUTTON', 'A']);
    }
    for (const href of [undefined, null, '', ' ', 123]) {
      const error = await container.renderToString(THeaderLink, { props: { href } }).catch((error: Error) => error.message);
      expect(error).toContain('href');
    }
  } finally { await window.happyDOM.close(); }
});

// 実Astro部品に3つの子セクションと属性を渡し、静的HTMLにネイティブの意味を残す。
test('Astroヘッダーは3領域と操作属性を静的HTMLへ出力する', async () => {
  const button = await container.renderToString(THeaderButton, { props: { iconOnly: true, 'aria-label': 'メニュー', 'data-action': 'menu' }, slots: { default: '図柄' } });
  const group = await container.renderToString(THeaderButtonGroup, { props: { 'aria-label': '表示形式' }, slots: { default: button } });
  const sections = await Promise.all([
    container.renderToString(THeaderSection, { props: { position: 'left' }, slots: { default: '<a href="/">ホーム</a>' } }),
    container.renderToString(THeaderSection, { props: { position: 'center' }, slots: { default: 'カレンダー名' } }),
    container.renderToString(THeaderSection, { props: { position: 'right' }, slots: { default: group } }),
  ]);
  const html = await container.renderToString(THeader, { props: { id: 'header', class: 'custom', scrollLabel: '予定の操作' }, slots: { default: sections.join('') } });
  const window = new Window();
  try {
    window.document.body.innerHTML = html;
    const host = window.document.body;
    expect(host.querySelector('header')?.className).toBe('tkw-header custom');
    expect(host.querySelector('[role="region"]')?.getAttribute('tabindex')).toBe('0');
    expect(host.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('予定の操作');
    expect(host.querySelector('[data-position="left"] a')?.getAttribute('href')).toBe('/');
    expect(host.querySelector('[data-position="center"]')?.textContent).toContain('カレンダー名');
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('表示形式');
    expect(host.querySelector('[data-action="menu"]')?.getAttribute('type')).toBe('button');
    expect(host.querySelector('button')?.hasAttribute('aria-pressed')).toBe(false);
    expect(host.querySelector('script')).toBeNull();
  } finally { await window.happyDOM.close(); }
});

// 全toneと選択/無効状態をSSR出力し、メニュー用ARIAとdata属性も保持する。
test('Astroボタンは全toneと明示された選択状態を保持し、不正値を拒否する', async () => {
  for (const tone of headerTones) {
    const html = await container.renderToString(THeaderButton, { props: { tone, selected: true, disabled: true,
      'aria-expanded': false, 'aria-controls': 'menu', 'data-action': 'open', class: 'custom' }, slots: { default: '操作' } });
    expect(html).toContain(`data-tone="${tone}"`); expect(html).toContain('aria-pressed="true"');
    expect(html).toContain(' disabled'); expect(html).toContain('aria-controls="menu"'); expect(html).toContain('data-action="open"');
  }
  for (const props of [{ tone: 'red' }, { type: 'link' }, { iconOnly: 1 }, { selected: null }]) {
    const error = await container.renderToString(THeaderButton, { props }).catch((error: Error) => error.message);
    expect(error).toMatch(/指定してください/);
  }
});

// 各セクションの任意の組み合わせを静的描画し、属性とDOM順を保持する。未指定や非対応positionは拒否する。
test('AstroのTHeaderSectionは領域の省略・属性転送とpositionの検証に対応する', async () => {
  const window = new Window();
  try {
    const positions = ['left', 'center', 'right'];
    for (let mask = 0; mask < 8; mask++) {
      const selected = positions.filter((_, i) => mask & (1 << i));
      const sections = await Promise.all(selected.map(position => container.renderToString(THeaderSection, {
        props: { position, class: 'custom', id: position, 'data-region': position }, slots: { default: position },
      })));
      window.document.body.innerHTML = await container.renderToString(THeader, { slots: { default: sections.join('') } });
      const nodes = [...window.document.querySelectorAll('.tkw-header-section')];
      expect(nodes.map(el => el.getAttribute('data-position'))).toEqual(selected);
      expect(window.document.querySelector('.tkw-header__content')?.children.length).toBe(selected.length);
      expect(nodes.every(el => el.classList.contains('custom') && el.id === el.getAttribute('data-region'))).toBe(true);
    }
    for (const position of [undefined, null, '', 'start', 'unknown', 1]) {
      const error = await container.renderToString(THeaderSection, { props: { position } }).catch((error: Error) => error.message);
      expect(error).toContain('left/center/right');
    }
  } finally { await window.happyDOM.close(); }
});

import { headerBackgroundColors, type HeaderBackgroundColor } from '../lib/header-background';
// 全背景色のSSR出力で、設定と利用側styleを保持し、独自propsをHTMLへ漏らさない。
test('astroヘッダーは全93色とネイティブstyleに対応する', async () => {
  const local = new Window();
  try {
    for (const backgroundColor of [undefined, ...headerBackgroundColors]) {
      const html = await container.renderToString(THeader, { props: { backgroundColor, style: 'margin-top:2px' } });
      local.document.body.innerHTML = html;
      const header = local.document.querySelector('header')!;
      expect(header.getAttribute('data-background')).toBe(backgroundColor ?? '--tkw-color-neutral-0');
      expect(header.style.getPropertyValue('--tkw-header-background')).toBe(`var(${backgroundColor ?? '--tkw-color-neutral-0'})`);
      expect(header.style.marginTop).toBe('2px');
      expect(header.hasAttribute('backgroundcolor')).toBe(false);
    }
  } finally { await local.happyDOM.close(); }
  const error = await container.renderToString(THeader, { props: { backgroundColor: 'red' as HeaderBackgroundColor } }).catch((error: Error) => error.message);
  expect(error).toContain('93カラートークン');
});
