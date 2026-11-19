import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { sidebarTags, sidebarMainTags } from '../src/lib/sidebar';
import type { AstroSidebarPreviews } from '../src/stories/sidebar-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroサイドバー見本の出力先を指定してください');
plugin({ name: 'astro-sidebar-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { default: SidebarExample } = await import('../src/stories/components/SidebarExample.astro');
const container = await experimental_AstroContainer.create();
const previews: AstroSidebarPreviews = {};
for (const view of ['left', 'right', 'both'] as const) for (const sidebarAs of sidebarTags) for (const mainAs of sidebarMainTags) {
  previews[`${view}:${sidebarAs}:${mainAs}`] = await container.renderToString(SidebarExample, { props: { view, sidebarAs, mainAs } });
}
await Bun.write(output, JSON.stringify(previews));
