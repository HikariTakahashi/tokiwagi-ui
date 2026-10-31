import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { headerTones, headerSectionPositions } from '../src/lib/header';
import { headerPreviewKey, type HeaderPreviewOptions, type AstroHeaderPreviews } from '../src/stories/header-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroヘッダー見本の出力先を指定してください');
plugin({ name: 'astro-header-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { default: Preview } = await import('../src/stories/fixtures/HeaderPreview.astro');
const container = await experimental_AstroContainer.create();
const previews: AstroHeaderPreviews = {};
const render = async (props: HeaderPreviewOptions) => {
  previews[headerPreviewKey(props)] = await container.renderToString(Preview, { props });
};
for (const tone of headerTones) for (const disabled of [false, true]) {
  for (const component of ['THeader', 'THeaderButtonGroup'] as const) {
    for (const view of ['year', 'month', 'week'] as const) await render({ component, tone, disabled, view });
  }
  for (const iconOnly of [false, true]) for (const selected of [undefined, false, true]) {
    await render({ component: 'THeaderButton', tone, disabled, iconOnly, selected });
  }
}
for (const position of headerSectionPositions) await render({ component: 'THeaderSection', tone: 'neutral', disabled: false, position });
await Bun.write(output, JSON.stringify(previews));
