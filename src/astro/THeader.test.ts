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
const { THeader, THeaderSection, THeaderButton, THeaderButtonGroup } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

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
