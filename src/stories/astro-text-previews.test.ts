import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import type { TextOptions } from '../lib/text';
import { astroTextPreviewHtml, type AstroTextPreviews } from './text-preview';

plugin({ name: 'astro-text-preview-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TText } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// Storybookのテンプレート更新と直接描画を比較し、設定変更・HTML風入力で表示が食い違わないことを確認する。
test('AstroのTText見本は実コンポーネントと同じ属性・スタイルを保ち、文字列を安全に更新する', async () => {
  const window = new Window(); const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document });
  try {
    const previews = {} as AstroTextPreviews;
    for (const as of ['span', 'p'] as const) previews[as] = await container.renderToString(TText, { props: { as } });
    const cases: TextOptions[] = [{}, { as: 'p', truncate: true }, { inherit: true },
      { size: { base: 'sm', sm: 'md', lg: 'lg' }, weight: 'bold', lineHeight: 2, tone: 'warning', lineClamp: 2, whiteSpace: 'pre-line', italic: true, decoration: 'line-through' }];
    for (const options of cases) {
      const direct = window.document.createElement('div');
      direct.innerHTML = await container.renderToString(TText, { props: options, slots: { default: '&lt;img src=x&gt; &amp; 日本語' } });
      const preview = window.document.createElement('div');
      preview.innerHTML = astroTextPreviewHtml(previews, { ...options, component: 'TText', text: '<img src=x> & 日本語' });
      const actual = preview.firstElementChild!; const expected = direct.firstElementChild!;
      expect(actual.tagName).toBe(expected.tagName); expect(actual.textContent).toBe(expected.textContent);
      for (const attr of expected.attributes) {
        if (attr.name === 'style') {
          const style = (expected as unknown as HTMLElement).style;
          for (let index = 0; index < style.length; index++) {
            const key = style.item(index); expect((actual as unknown as HTMLElement).style.getPropertyValue(key)).toBe(style.getPropertyValue(key));
          }
        } else expect(actual.getAttribute(attr.name)).toBe(attr.value);
      }
      expect(actual.querySelector('img')).toBeNull();
    }
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous); else Reflect.deleteProperty(globalThis, 'document');
    await window.happyDOM.close();
  }
});
