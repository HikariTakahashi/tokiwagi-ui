import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { logoSizes } from '../lib/logo';
import { assertLogoHtml } from '../lib/logo-test-helpers';
import type { TLogoProps } from './TLogoProps';

plugin({ name: 'astro-logo-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TLogo } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const render = (props: TLogoProps | Record<string, unknown> = {}) => container.renderToString(TLogo, { props });

// 公開入口の実コンポーネントを全サイズ・読み上げ状態で描画し、原本と余白を照合する。
test('AstroのTLogoは原本の配色と3サイズ・余白・代替テキストを維持する', async () => {
  assertLogoHtml(await render(), 32, false);
  for (const size of logoSizes) for (const decorative of [false, true])
    assertLogoHtml(await render({ size, decorative }), size, decorative);
});

// 型を迂回した不正値を拒否し、固定サイズと読み上げの意図を守る。
test('AstroのTLogoは非対応サイズと不正なdecorativeを拒否する', async () => {
  for (const size of [16, 24, 48, 0, NaN, '32', null])
    expect(await render({ size }).catch((error: Error) => error.message)).toContain('32/64/128px');
  expect(await render({ decorative: 'false' }).catch((error: Error) => error.message)).toContain('boolean');
});

// 配置用classだけを転送し、追加属性とslotでは原本・寸法・代替テキストを変更できない。
test('AstroのTLogoは配置用classだけを受け取り、追加属性とslotを転送しない', async () => {
  const html = await container.renderToString(TLogo, {
    props: { decorative: true, class: 'brand-logo', color: 'red', width: 16, style: 'padding:0', tabindex: 0, src: 'bad.svg', alt: '上書き', onclick: '操作' },
    slots: { default: '挿入' },
  });
  assertLogoHtml(html, 32, true);
  expect(html).toContain('class="brand-logo"');
  expect(html).not.toMatch(/bad.svg|上書き|挿入|tabindex|onclick|color:red|padding:0/);
});
