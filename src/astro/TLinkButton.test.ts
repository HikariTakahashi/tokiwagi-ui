import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { linkTones } from '../lib/link';
plugin({ name: 'astro-link-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({ contents: transform(await Bun.file(args.path).text(), {
    filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
  }).code, loader: 'js' }));
} });
const { TLinkButton } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// JSなしでもhrefと操作属性を除き、無効なリンクの読み上げ状態とアイコンを静的に提供する。
test('Astroの無効なTLinkButtonはスクリプトなしで遷移と操作を抑止する', async () => {
  const window = new Window();
  try {
    const html = await container.renderToString(TLinkButton, { props: {
      href: '/download', disabled: true, target: '_blank', download: 'file', rel: 'external', ping: '/track',
      tabindex: 5, autofocus: true, contenteditable: true, onclick: 'alert(1)', onkeydown: 'alert(1)',
      role: 'button', 'aria-disabled': 'false', 'aria-describedby': 'hint', leadingIcon: 'moon', trailingIcon: 'tool',
    }, slots: { default: '準備中' } });
    window.document.body.innerHTML = html;
    const anchor = window.document.querySelector('a')!;
    for (const name of ['href', 'target', 'download', 'rel', 'ping', 'tabindex', 'autofocus', 'contenteditable', 'onclick', 'onkeydown', 'disabled']) expect(anchor.hasAttribute(name)).toBe(false);
    expect(anchor.getAttribute('role')).toBe('link');
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.hasAttribute('data-disabled')).toBe(true);
    expect(anchor.getAttribute('aria-describedby')).toBe('hint');
    expect(anchor.querySelectorAll('svg')).toHaveLength(2);
    expect(html).not.toMatch(/<script|astro-island/);
  } finally { await window.happyDOM.close(); }
});

// 8色の静的リンクでslot・属性・relと両アイコンの独立したクリッピングを検証する。
test('AstroのTLinkButtonは遷移と装飾を静的HTMLで提供する', async () => {
  const window = new Window();
  try {
    for (const tone of linkTones) {
      const html = await container.renderToString(TLinkButton, { props: { href: '/予定?日付=今日', tone, target: '_blank', rel: 'opener external',
        leadingIcon: 'moon', trailingIcon: 'moon', 'aria-current': 'page', class: 'details', 'data-kind': 'event' },
        slots: { default: '<em>予定の詳細</em>' } });
      window.document.body.innerHTML = html;
      const anchor = window.document.querySelector('a')!;
      expect(anchor.getAttribute('href')).toBe('/予定?日付=今日');
      expect(anchor.rel).toBe('external noopener');
      expect(anchor.className).toBe('tkw-button tkw-link-button details');
      expect(anchor.getAttribute('data-tone')).toBe(tone);
      expect(anchor.getAttribute('data-kind')).toBe('event');
      expect(anchor.hasAttribute('data-current')).toBe(true);
      expect(anchor.querySelector('em')?.textContent).toBe('予定の詳細');
      expect(anchor.querySelectorAll('svg[width="32"][aria-hidden="true"]')).toHaveLength(2);
      const ids = [...anchor.querySelectorAll('[id]')].map(el => el.id);
      expect(new Set(ids).size).toBe(2);
      expect(html).not.toMatch(/<script|astro-island/);
    }
    const plain = await container.renderToString(TLinkButton, { props: { href: '#details' }, slots: { default: '詳細' } });
    expect(plain).not.toContain('<svg');
    await expect(container.renderToString(TLinkButton, { props: { href: ' ' } })).rejects.toThrow('TLinkButtonのhref');
  } finally { await window.happyDOM.close(); }
});

// 実Astro出力で全サイズの寸法属性と既定値、同じ図柄を前後に置いた参照分離を確認する。
test('TLinkButtonは全サイズの装飾アイコンと既定サイズを静的に出力する', async () => {
  const window = new Window();
  try {
    for (const [size, iconSize] of [[undefined, 32], ['sm', 20], ['md', 24], ['lg', 32]] as const) {
      window.document.body.innerHTML = await container.renderToString(TLinkButton, { props: { href: '/', size, leadingIcon: 'moon', trailingIcon: 'moon' } });
      const anchor = window.document.querySelector('a')!;
      expect(anchor.getAttribute('data-size')).toBe(size ?? 'lg');
      expect(anchor.hasAttribute('size')).toBe(false);
      expect([...anchor.querySelectorAll('svg')].map(icon => icon.getAttribute('width'))).toEqual([String(iconSize), String(iconSize)]);
      expect(new Set([...anchor.querySelectorAll('[id]')].map(el => el.id)).size).toBe(2);
    }
  } finally { await window.happyDOM.close(); }
});
