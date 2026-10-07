import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { logoSizes } from '../lib/logo';
import { assertBrandHtml } from '../lib/brand-test-helpers';

plugin({ name: 'astro-brand-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TBrand } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// 公開入口のAstro実コンポーネントを描画し、全サイズで原本と名称を検証する。
test('AstroのTBrandは既定32pxと全サイズで原本・名称・余白を維持する', async () => {
  assertBrandHtml(await container.renderToString(TBrand), 32);
  for (const size of logoSizes) assertBrandHtml(await container.renderToString(TBrand, { props: { size } }), size);
});

// 型を迂回した不正値も描画時に拒否する。
test('AstroのTBrandは非対応サイズと不正な型を拒否する', async () => {
  for (const size of [16, 24, 48, 0, -32, Infinity, NaN, '32', null])
    expect(await container.renderToString(TBrand, { props: { size } }).catch((error: Error) => error.message)).toContain('32/64/128px');
});

// classは外側だけに置き、追加属性・イベント・slotで静的表示を変更できない。
test('AstroのTBrandは外側のclassだけを転送し、追加属性・イベント・slotを無視する', async () => {
  const html = await container.renderToString(TBrand, {
    props: { class: 'brand', name: '別名称', decorative: false, style: 'padding:0', tabindex: 0,
      role: 'button', 'aria-label': '上書き', href: '/', title: '追加', onclick: '操作' },
    slots: { default: '挿入', name: '別名称' },
  });
  assertBrandHtml(html, 32, 'brand');
  expect(html).not.toMatch(/別名称|上書き|追加|挿入|tabindex|href=|role=|onclick/);
});
