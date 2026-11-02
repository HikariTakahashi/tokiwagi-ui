import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import type { AstroTextPreviews } from '../src/stories/text-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroテキスト見本の出力先を指定してください');
plugin({ name: 'astro-text-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TText } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const previews = {} as AstroTextPreviews;
for (const as of ['span', 'p'] as const)
  previews[as] = await container.renderToString(TText, { props: { as }, slots: { default: '今日の予定を確認できます。' } });
await Bun.write(output, JSON.stringify(previews));
