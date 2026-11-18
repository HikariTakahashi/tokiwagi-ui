import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import type { AstroButtonPreviews } from '../src/stories/button-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroボタン見本の出力先を指定してください');
plugin({ name: 'astro-button-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TButton } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const previews: AstroButtonPreviews = {
  button: await container.renderToString(TButton, {
    props: { leadingIcon: 'save' }, slots: { default: '操作' },
  }),
};
await Bun.write(output, JSON.stringify(previews));
