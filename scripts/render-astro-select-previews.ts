import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { selectExampleOptions } from '../src/stories/select-preview';
import type { AstroSelectPreviews } from '../src/stories/select-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroセレクト見本の出力先を指定してください');
plugin({ name: 'astro-select-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TSelect } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const previews: AstroSelectPreviews = { select: await container.renderToString(TSelect, {
  props: { options: selectExampleOptions(), label: '見本', description: '補足', error: 'エラー', value: 'button' },
}) };
await Bun.write(output, JSON.stringify(previews));
