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
