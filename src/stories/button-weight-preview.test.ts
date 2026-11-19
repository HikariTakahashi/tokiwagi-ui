import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { textWeights } from '../lib/text';
import { astroButtonPreviewHtml } from './button-preview';
import { astroLinkButtonPreviewHtml } from './link-button-preview';
import type { AstroIconPreviews } from './components/astro-preview';

plugin({ name: 'astro-button-weight-preview-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TButton, TLinkButton } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// 太さの残った実テンプレートからControlsの未指定を復元し、無効リンクでも同じ太さを反映する。
test('Astroの両ボタン見本は4段階の指定と継承への復元を実部品と揃える', async () => {
  const window = new Window();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document });
  try {
    const props = { href: '/', weight: 'bold', leadingIcon: 'moon', trailingIcon: 'tool' };
    const buttons = { button: await container.renderToString(TButton, { props }) };
    const links = {
      link: await container.renderToString(TLinkButton, { props }),
      disabledLink: await container.renderToString(TLinkButton, { props: { ...props, disabled: true } }),
    };
    const icons = {} as AstroIconPreviews;
    for (const weight of [undefined, ...textWeights]) {
      for (const disabled of [false, true]) {
        const options = { tone: 'neutral' as const, weight, disabled, text: '保存' };
        const outputs = [
          astroButtonPreviewHtml(buttons, icons, { ...options, component: 'TButton' }, 'button'),
          astroLinkButtonPreviewHtml(links, icons, { ...options, href: '/', component: 'TLinkButton' }, 'link'),
        ];
        for (const output of outputs) {
          window.document.body.innerHTML = output;
          const node = window.document.querySelector('.tkw-button')!;
          expect(node.getAttribute('data-weight')).toBe(weight ?? null);
          expect(node.hasAttribute('weight')).toBe(false);
        }
      }
    }
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    else Reflect.deleteProperty(globalThis, 'document');
    await window.happyDOM.close();
  }
});
