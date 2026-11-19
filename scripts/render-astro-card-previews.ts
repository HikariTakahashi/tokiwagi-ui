import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { cardTags } from '../src/lib/card';
import { cardViews, type AstroCardPreviews } from '../src/stories/card-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroカード見本の出力先を指定してください');
plugin({ name: 'astro-card-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { default: CardExample } = await import('../src/stories/components/CardExample.astro');
const container = await experimental_AstroContainer.create();
const previews = {} as AstroCardPreviews;
for (const view of cardViews) {
  previews[view] = {} as AstroCardPreviews[typeof view];
  for (const as of cardTags) previews[view][as] = await container.renderToString(CardExample, { props: { view, as } });
}
await Bun.write(output, JSON.stringify(previews));
