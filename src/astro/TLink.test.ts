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
const { TLink } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// 8色の静的リンクでslot・属性・relと両アイコンの独立したクリッピングを検証する。
test('AstroのTLinkは遷移と装飾を静的HTMLで提供する', async () => {
  const window = new Window();
  try {
    for (const tone of linkTones) {
      const html = await container.renderToString(TLink, { props: { href: '/予定?日付=今日', tone, target: '_blank', rel: 'opener external',
        leadingIcon: 'moon', trailingIcon: 'moon', 'aria-current': 'page', class: 'details', 'data-kind': 'event' },
        slots: { default: '<em>予定の詳細</em>' } });
      window.document.body.innerHTML = html;
      const anchor = window.document.querySelector('a')!;
      expect(anchor.getAttribute('href')).toBe('/予定?日付=今日');
      expect(anchor.rel).toBe('external noopener');
      expect(anchor.className).toBe('tkw-link details');
      expect(anchor.getAttribute('data-tone')).toBe(tone);
      expect(anchor.getAttribute('data-kind')).toBe('event');
      expect(anchor.hasAttribute('data-current')).toBe(true);
      expect(anchor.querySelector('em')?.textContent).toBe('予定の詳細');
      expect(anchor.querySelectorAll('svg[width="16"][aria-hidden="true"]')).toHaveLength(2);
      const ids = [...anchor.querySelectorAll('[id]')].map(el => el.id);
      expect(new Set(ids).size).toBe(2);
      expect(html).not.toMatch(/<script|astro-island/);
    }
    const plain = await container.renderToString(TLink, { props: { href: '#details' }, slots: { default: '詳細' } });
    expect(plain).not.toContain('<svg');
    await expect(container.renderToString(TLink, { props: { href: ' ' } })).rejects.toThrow('TLinkのhref');
  } finally { await window.happyDOM.close(); }
});

// 実Astro出力で全サイズの寸法属性と既定値、同じ図柄を前後に置いた参照分離を確認する。
test('TLinkは全サイズの装飾アイコンと既定サイズを静的に出力する', async () => {
  const window = new Window();
  try {
    for (const [size, iconSize] of [[undefined, 16], ['inherit', 16], ['sm', 16], ['md', 16], ['lg', 20]] as const) {
      window.document.body.innerHTML = await container.renderToString(TLink, { props: { href: '/', size, leadingIcon: 'moon', trailingIcon: 'moon' } });
      const anchor = window.document.querySelector('a')!;
      expect(anchor.getAttribute('data-size')).toBe(size ?? 'inherit');
      expect(anchor.hasAttribute('size')).toBe(false);
      expect([...anchor.querySelectorAll('svg')].map(icon => icon.getAttribute('width'))).toEqual([String(iconSize), String(iconSize)]);
      expect(new Set([...anchor.querySelectorAll('[id]')].map(el => el.id)).size).toBe(2);
    }
  } finally { await window.happyDOM.close(); }
});
