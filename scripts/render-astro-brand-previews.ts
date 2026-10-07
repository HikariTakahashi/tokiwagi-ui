import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { logoSizes } from '../src/lib/logo';
import type { AstroBrandPreviews } from '../src/stories/astro-brand-previews';

const output = Bun.argv[2];
if (!output) throw new Error('Astroブランド見本の出力先を指定してください');
plugin({ name: 'astro-brand-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TBrand } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const previews = {} as AstroBrandPreviews;
for (const size of logoSizes) {
  previews[size] = await container.renderToString(TBrand, { props: { size } });
}
await Bun.write(output, JSON.stringify(previews));
