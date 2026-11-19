import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { invalidCardOptions } from '../lib/card-test-helpers';
import { cardViews, type AstroCardPreviews } from '../stories/card-preview';
import { cardTags } from '../lib/card';

plugin({ name: 'astro-card-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TCard, TCardHeader, TCardTitle, TCardDescription, TCardBody, TCardFooter, TCardMedia, TCardActionArea } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// 実Astro部品のslotと属性を保持し、すべての構造パーツをスクリプトなしで描画する。
test('AstroのTCardは全パーツとネイティブ属性を静的HTMLに保持する', async () => {
  const render = (component: Parameters<typeof container.renderToString>[0], props = {}, content = '') => container.renderToString(component, { props, slots: { default: content } });
  const window = new Window();
  try {
    const content = await render(TCardMedia, { class: 'cover' }, '<img src="/cover.png" alt="カードの設計図">')
      + await render(TCardHeader, { title: '見出し' }, await render(TCardTitle, { as: 'h2', id: 'example-title' }, '設計') + await render(TCardDescription, {}, '補足'))
      + await render(TCardBody, {}, '&lt;script&gt;実行しない&lt;/script&gt;<strong>重要</strong>')
      + await render(TCardFooter, {}, '<button type="button">保存</button>');
    const html = await render(TCard, { as: 'article', variant: 'subtle', size: 'sm', class: 'custom', 'aria-labelledby': 'example-title', 'aria-busy': true, style: { 'max-width': '414px' } }, content);
    window.document.body.innerHTML = html;
    const card = window.document.body.firstElementChild as unknown as HTMLElement;
    expect(card.tagName).toBe('ARTICLE'); expect(card.className).toBe('tkw-card custom');
    expect(card.dataset.variant).toBe('subtle'); expect(card.dataset.size).toBe('sm'); expect(card.style.maxWidth).toBe('414px');
    expect(card.getAttribute('aria-busy')).toBe('true'); expect(card.getAttribute('aria-labelledby')).toBe('example-title');
    expect(card.querySelector('h2')?.id).toBe('example-title'); expect(card.querySelector('img')?.getAttribute('alt')).toBe('カードの設計図');
    expect(card.querySelector('.tkw-card-header')?.getAttribute('title')).toBe('見出し');
    expect(card.querySelector('.tkw-card-description')?.tagName).toBe('P'); expect(card.querySelector('strong')?.textContent).toBe('重要');
    expect(card.querySelector('.tkw-card-footer button')).not.toBeNull();
    expect(card.querySelector('script')).toBeNull(); expect(card.textContent).toContain('<script>実行しない</script>');
    expect(html).not.toMatch(/<script|astro-island/);
    const linked = await render(TCardActionArea, { href: '/guide', target: '_blank', rel: 'external opener', class: 'custom', 'aria-current': 'page' }, '導入');
    window.document.body.innerHTML = linked;
    const link = window.document.body.querySelector('a')!;
    expect(link.href).toContain('/guide'); expect(link.rel).toBe('external noopener');
    expect(link.className).toBe('tkw-card-action-area custom'); expect(link.getAttribute('aria-current')).toBe('page');
    for (const [key, value] of invalidCardOptions) {
      const error = await render(TCard, { [key]: value }).catch((error: Error) => error.message); expect(error).toContain(key);
    }
    expect(await render(TCardActionArea, { href: '' }).catch((error: Error) => error.message)).toContain('href');
    expect(await render(TCardTitle, { as: 'div' }).catch((error: Error) => error.message)).toContain('as');
  } finally { await window.happyDOM.close(); }
});

// Storybookが架空のHTMLでなく、全用途・全ルート要素の公開Astro実装を収録していることを検証する。
test('AstroのTCard見本は4用途と3要素を実コンポーネントで描画する', async () => {
  const { default: CardExample } = await import('../stories/components/CardExample.astro');
  const previews = {} as AstroCardPreviews;
  for (const view of cardViews) {
    previews[view] = {} as AstroCardPreviews[typeof view];
    for (const as of cardTags) {
      const html = await container.renderToString(CardExample, { props: { view, as } });
      previews[view][as] = html;
      expect(html.startsWith(`<${as} `)).toBe(true);
      expect(html).toContain('data-variant="outline" data-size="md"');
      expect(html).toContain('tkw-card-title');
      expect(html).not.toMatch(/<script|astro-island/);
    }
  }
  expect(previews.media.div).toContain('tkw-card-media');
  expect(previews.link.div).toContain('tkw-card-action-area');
  expect(previews.task.div).toContain('進行中');
});
