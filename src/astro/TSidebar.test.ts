import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';

plugin({ name: 'astro-sidebar-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TSidebarLayout, TSidebar, TSidebarMain, TSidebarHeader, TSidebarBody, TSidebarFooter } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const render = (component: Parameters<typeof container.renderToString>[0], props = {}, content = '') =>
  container.renderToString(component, { props, slots: { default: content } });

// 全パーツを公開Astro入口から静的描画し、属性・slot・閉鎖状態・文字列/オブジェクトstyleを保持する。
test('Astroのサイドバーは全パーツと左右の状態をスクリプトなしで描画する', async () => {
  const window = new Window();
  try {
    const header = await render(TSidebarHeader, { title: '見出し' }, '<strong>目次</strong>');
    const body = await render(TSidebarBody, { 'data-body': 'yes' }, '<a href="#main">ガイド</a>');
    const footer = await render(TSidebarFooter, { id: 'footer' }, '補足');
    const left = await render(TSidebar, { side: 'left', 'aria-label': '目次', class: 'custom', style: 'max-height:500px' }, header + body + footer);
    const main = await render(TSidebarMain, { as: 'main', id: 'main' }, '<input value="保持する入力">');
    const right = await render(TSidebar, { side: 'right', as: 'div', width: 240, open: false, 'aria-hidden': false, style: { color: 'inherit' } }, '情報');
    const html = await render(TSidebarLayout, { gap: 0, animationDuration: 0, style: 'max-width:1000px', 'data-layout': 'example' }, left + main + right);
    window.document.body.innerHTML = html;
    const layout = window.document.body.firstElementChild as unknown as HTMLElement;
    const leftNode = layout.querySelector<HTMLElement>('[data-side="left"]')!;
    const rightNode = layout.querySelector<HTMLElement>('[data-side="right"]')!;
    expect(layout.style.getPropertyValue('--tkw-sidebar-gap')).toBe('0px'); expect(layout.style.getPropertyValue('--tkw-sidebar-duration')).toBe('0ms');
    expect(layout.style.maxWidth).toBe('1000px'); expect(layout.getAttribute('data-layout')).toBe('example');
    expect(leftNode.className).toBe('tkw-sidebar custom'); expect(leftNode.dataset.open).toBe('true'); expect(leftNode.hasAttribute('inert')).toBe(false);
    expect(leftNode.style.maxHeight).toBe('500px'); expect(leftNode.style.getPropertyValue('--tkw-sidebar-width')).toBe('280px');
    expect(rightNode.tagName).toBe('DIV'); expect(rightNode.hasAttribute('inert')).toBe(true); expect(rightNode.getAttribute('aria-hidden')).toBe('true');
    expect(rightNode.style.getPropertyValue('--tkw-sidebar-width')).toBe('240px'); expect(rightNode.style.color).toBe('inherit');
    expect(layout.querySelector('.tkw-sidebar-header')?.getAttribute('title')).toBe('見出し');
    expect(layout.querySelector('.tkw-sidebar-body')?.getAttribute('data-body')).toBe('yes');
    expect(layout.querySelector('a')?.getAttribute('href')).toBe('#main'); expect(layout.querySelector('main')?.id).toBe('main');
    expect(layout.querySelector('.tkw-sidebar-footer')?.id).toBe('footer'); expect(html).not.toMatch(/<script|astro-island/);
  } finally { await window.happyDOM.close(); }
});

// 直下だけをHTMLパーサーで検証し、本文中の同名要素やscript風文字列に個数判定を影響させない。
test('Astroのサイドバーレイアウトは直下の順序と個数を検証する', async () => {
  const main = await render(TSidebarMain, {}, '<div class="tkw-sidebar">本文の同名クラス</div><script type="application/json">{"text":"<main>"}</script>');
  const left = await render(TSidebar, { side: 'left' });
  const right = await render(TSidebar, { side: 'right' });
  expect(await render(TSidebarLayout, {}, '<!--省略-->' + main + right)).toContain('data-side="right"');
  expect(await render(TSidebarLayout, {}, '<script type="module" src="/example.js"></script><style>p{margin:0}</style><link rel="stylesheet" href="/example.css">' + main)).toContain('src="/example.js"');
  for (const content of ['', left, main + main, left + left + main, right + main, '<div>別ラッパー</div>', '本文' + main])
    expect(await render(TSidebarLayout, {}, content).catch((error: Error) => error.message)).toContain('TSidebarLayout');
  for (const [key, value] of [['width', 0], ['width', Infinity], ['open', null], ['as', 'nav'], ['side', 'top']] as const)
    expect(await render(TSidebar, { side: 'left', [key]: value }).catch((error: Error) => error.message)).toContain(key);
  for (const key of ['gap', 'animationDuration'])
    expect(await render(TSidebarLayout, { [key]: -1 }, main).catch((error: Error) => error.message)).toContain(key);
  expect(await render(TSidebarMain, { as: 'article' }).catch((error: Error) => error.message)).toContain('as');
});
