import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { iconSizes } from '../src/lib/icon-assets';
import type { AstroIconPreviews } from '../src/stories/components/astro-preview';

const output = Bun.argv[2];
if (!output) throw new Error('Astroプレビューの出力先ファイルを指定してください');

// StorybookのNodeプロセスから独立したBunプロセスで、公開入口の実コンポーネントを描画する。
plugin({ name: 'astro-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code,
    loader: 'js',
  }));
} });

const { TIcon, iconNames } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const previews = {} as AstroIconPreviews;
for (const name of iconNames) {
  const sizes = {} as AstroIconPreviews[typeof name];
  for (const size of iconSizes) sizes[size] = await container.renderToString(TIcon, { props: { name, size } });
  previews[name] = sizes;
}
// 全データの書き込み完了を待つ。失敗時は非ゼロ終了でビルドを止める。
await Bun.write(output, JSON.stringify(previews));
