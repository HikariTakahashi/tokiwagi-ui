import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { logoSizes } from '../src/lib/logo';
import type { AstroLogoPreviews } from '../src/stories/astro-logo-previews';

const output = Bun.argv[2];
if (!output) throw new Error('Astroロゴ見本の出力先を指定してください');
plugin({ name: 'astro-logo-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TLogo } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const previews = {} as AstroLogoPreviews;
for (const size of logoSizes) {
  previews[size] = {
    standalone: await container.renderToString(TLogo, { props: { size } }),
    decorative: await container.renderToString(TLogo, { props: { size, decorative: true } }),
  };
}
await Bun.write(output, JSON.stringify(previews));
