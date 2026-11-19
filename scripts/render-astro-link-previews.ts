import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import type { AstroLinkPreviews } from '../src/stories/link-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroリンク見本の出力先を指定してください');
plugin({ name: 'astro-link-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TLink } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const previews: AstroLinkPreviews = {
  link: await container.renderToString(TLink, {
    props: { href: '#link-target', leadingIcon: 'moon', trailingIcon: 'tool' }, slots: { default: '操作' },
  }),
};
await Bun.write(output, JSON.stringify(previews));
