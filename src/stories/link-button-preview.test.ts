import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { astroLinkButtonPreviewHtml } from './link-button-preview';
import type { AstroIconPreviews } from './components/astro-preview';
plugin({ name: 'astro-link-button-preview-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({ contents: transform(await Bun.file(args.path).text(), {
    filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
  }).code, loader: 'js' }));
} });
const { TLinkButton, TIcon } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// HTML風の文言とURL記号を安全に反映し、両側に同じ図柄があってもIDと参照を分離する。
test('AstroのTLinkButton見本は安全な属性・文言と独立した両アイコンを保持する', async () => {
  const window = new Window();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document });
  try {
    const previews = {
      link: await container.renderToString(TLinkButton, { props: { href: '/', leadingIcon: 'moon', trailingIcon: 'tool' } }),
      disabledLink: await container.renderToString(TLinkButton, { props: { href: '/', disabled: true, leadingIcon: 'moon', trailingIcon: 'tool' } }),
    };
    const icons = { moon: {} } as AstroIconPreviews;
    for (const iconSize of [16, 20, 24, 32] as const) {
      icons.moon[iconSize] = await container.renderToString(TIcon, { props: { name: 'moon', size: iconSize } });
    }
    for (const tone of ['blue', 'neutral-0', 'neutral-600', 'neutral-800', 'neutral-900'] as const) for (const disabled of [false, true]) for (const size of ['sm', 'md', 'lg'] as const) for (const current of [undefined, 'false', 'page'] as const) for (const icon of [undefined, 'moon'] as const) {
      window.document.body.innerHTML = astroLinkButtonPreviewHtml(previews, icons, {
        component: 'TLinkButton', disabled, size, href: '/予定?a=" & <img>', text: '<img src=x> & 日本語', tone, target: '_blank',
        rel: 'external opener', current, leadingIcon: icon, trailingIcon: icon,
      }, 'link-test');
      const anchor = window.document.querySelector('a')!;
      expect(anchor.getAttribute('href')).toBe(disabled ? null : '/予定?a=" & <img>');
      expect(anchor.getAttribute('aria-disabled')).toBe(disabled ? 'true' : null);
      expect(anchor.hasAttribute('data-disabled')).toBe(disabled);
      expect(anchor.getAttribute('data-size')).toBe(size);
      expect(anchor.getAttribute('data-tone')).toBe(tone);
      if (icon) expect(anchor.querySelector('svg')?.getAttribute('width')).toBe(String(({ sm: 20, md: 24, lg: 32 })[size]));
      expect(anchor.querySelector('.tkw-link-button__label')?.textContent).toBe('<img src=x> & 日本語');
      expect(anchor.querySelector('img')).toBeNull();
      expect(anchor.rel).toBe(disabled ? '' : 'external noopener');
      expect(anchor.getAttribute('aria-current')).toBe(current ?? null);
      expect(anchor.hasAttribute('data-current')).toBe(current === 'page');
      expect(anchor.querySelectorAll('svg')).toHaveLength(icon ? 2 : 0);
      const ids = [...anchor.querySelectorAll('[id]')].map(el => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const part of anchor.querySelectorAll('[clip-path]')) {
        expect(ids).toContain(part.getAttribute('clip-path')!.slice(5, -1));
      }
    }
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor); else Reflect.deleteProperty(globalThis, 'document');
    await window.happyDOM.close();
  }
});
