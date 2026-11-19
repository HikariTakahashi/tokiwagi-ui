import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import type { AstroLinkButtonPreviews } from '../src/stories/link-button-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroボタン型リンク見本の出力先を指定してください');
plugin({ name: 'astro-link-button-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TLinkButton } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const previews: AstroLinkButtonPreviews = {
  link: await container.renderToString(TLinkButton, {
    props: { href: '#link-button-target', leadingIcon: 'moon', trailingIcon: 'tool' }, slots: { default: 'カレンダーを開く' },
  }),
  disabledLink: await container.renderToString(TLinkButton, {
    props: { href: '#link-button-target', disabled: true, leadingIcon: 'moon', trailingIcon: 'tool' }, slots: { default: 'カレンダーを開く' },
  }),
};
await Bun.write(output, JSON.stringify(previews));
