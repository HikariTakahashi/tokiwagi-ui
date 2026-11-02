import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { invalidTextOptions } from '../lib/text-test-helpers';

plugin({ name: 'astro-text-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TText } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// 静的出力が標準属性・slot・styleを保持し、スクリプトやハイドレーションを必要としないことを確認する。
test('AstroのTTextはslotと属性と全設定を静的HTMLへ出力する', async () => {
  const window = new Window();
  try {
    const html = await container.renderToString(TText, { props: { as: 'p', size: { base: 'sm', sm: 'md', lg: 'lg' },
      weight: 'semibold', lineHeight: 1.8, tone: 'error', whiteSpace: 'pre-wrap', lineClamp: 3,
      italic: true, decoration: 'underline', id: 'description', class: 'custom', title: '補足',
      'aria-live': 'polite', 'data-test': 'text', style: { 'max-width': '320px' },
    }, slots: { default: '今日の予定 <strong>重要</strong><a href="#details">詳細</a>&lt;img src=x&gt; &amp; 日本語' } });
    window.document.body.innerHTML = html;
    const node = window.document.body.firstElementChild as unknown as HTMLElement;
    expect(node.tagName).toBe('P'); expect(node.className).toBe('tkw-text custom'); expect(node.id).toBe('description');
    expect(node.style.maxWidth).toBe('320px'); expect(node.getAttribute('aria-live')).toBe('polite');
    expect(node.dataset.test).toBe('text'); expect(node.querySelector('strong')?.textContent).toBe('重要');
    expect(node.querySelector('a')?.getAttribute('href')).toBe('#details'); expect(node.querySelector('img')).toBeNull();
    expect(node.textContent).toContain('<img src=x> & 日本語');
    expect(node.style.getPropertyValue('--tkw-text-size-lg')).toBe('1.125rem');
    expect(node.style.getPropertyValue('--tkw-text-line-height')).toBe('1.8');
    expect(node.style.getPropertyValue('--tkw-text-line-clamp')).toBe('3');
    expect(html).not.toMatch(/<script|astro-island/);
    expect(await container.renderToString(TText, { slots: { default: '' } })).not.toContain('undefined');
    for (const [name, value] of invalidTextOptions) {
      const error = await container.renderToString(TText, { props: { [name]: value } }).catch((error: Error) => error.message);
      expect(error).toContain(name);
    }
    const error = await container.renderToString(TText, { props: { truncate: true, lineClamp: 2 } }).catch((error: Error) => error.message);
    expect(error).toContain('同時');
  } finally { await window.happyDOM.close(); }
});
