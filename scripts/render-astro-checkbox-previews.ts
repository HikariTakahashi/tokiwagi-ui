import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';

const output = Bun.argv[2];
if (!output) throw new Error('Astroチェックボックス見本の出力先を指定してください');
plugin({ name: 'astro-checkbox-preview-compiler', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code,
    loader: 'js',
  }));
} });
const { TCheckbox } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const outputHtml = await container.renderToString(TCheckbox, {
  props: { label: '見本', description: '補足', error: 'エラー', id: 'tkw-checkbox-preview' },
});
// 見本の操作はStorybook側で接続する。コンテナーが出力する開発用スクリプトは配信しない。
const html = outputHtml.replace(/<script\b[^>]*><\/script>\s*$/, '').trimEnd();
await Bun.write(output, JSON.stringify(html));
