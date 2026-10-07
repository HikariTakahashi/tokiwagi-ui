import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { iconSources, iconNames, type IconName } from '../lib/icon-sources';
import { iconSizes, isBrandAssetName } from '../lib/icon-assets';
import type { TIconProps } from './TIconProps';

// Bunでも実際の.astroソースをAstroのコンパイラで変換し、公式Containerで描画する。
plugin({ name: 'astro-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: (transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    })).code,
    loader: 'js',
  }));
} });
const { TIcon, isIconName } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();
const render = (props: TIconProps | Record<string, unknown>) => container.renderToString(TIcon, { props });
const geometry = (svg: string) => svg.match(/\b(?:d|viewBox|stroke-width|stroke-linecap|stroke-linejoin|fill-rule|clip-rule)="[^"]*"/g);

// 共通公開名と原本を照合し、Astroでも全329図柄を選べることを確認する。
test('Astroの公開名と読み込むSVGは全329原本に一致する', () => {
  const directory = new URL('../../icons/', import.meta.url);
  expect<readonly string[]>(iconNames).toEqual(readdirSync(directory).filter(name => !isBrandAssetName(name)).sort());
  expect(iconNames).toHaveLength(329);
  for (const name of iconNames) expect(iconSources[name]).toBe(readFileSync(new URL(`${name}/${name}.svg`, directory), 'utf8'));
});

// 全図柄を4サイズで実際に描画し、形状・線幅・透明な塗り・白いクリッピングと着色を照合する。
test('Astroコンポーネントは全原本の形状と着色を4サイズで維持する', async () => {
  for (const name of iconNames) for (const size of iconSizes) {
    const svg = await render({ name, size });
    const source = iconSources[name];
    expect(geometry(svg)).toEqual(geometry(source));
    expect(svg).toContain(`width="${size}" height="${size}"`);
    expect(svg).not.toMatch(/(?:fill|stroke)="black"/);
    expect(svg.match(/currentColor"/g)?.length).toBe(source.match(/(?:fill|stroke)="black"/g)?.length);
    for (const fill of ['none', 'white']) expect(svg.match(new RegExp(`fill="${fill}"`, 'g'))?.length).toBe(source.match(new RegExp(`fill="${fill}"`, 'g'))?.length);
    expect(svg).toContain('aria-hidden="true" focusable="false"');
  }
});

// 同一図柄を並行して繰り返し描画してもIDが衝突せず、全参照が自身のSVG内を指す。
test('moonとtoolの並行描画と複数表示でクリッピングIDが衝突しない', async () => {
  const svgs = await Promise.all(Array.from({ length: 32 }, (_, index) => render({ name: index % 2 ? 'moon' : 'tool' })));
  const ids: string[] = [];
  for (const svg of svgs) {
    const id = svg.match(/\bid="([^"]+)"/)![1]!;
    expect(id).toMatch(/^tkw-astro-[\w-]+$/);
    expect(svg).toContain(`url(#${id})`);
    ids.push(id);
  }
  expect(new Set(ids).size).toBe(svgs.length);
});

// 型を迂回した外部入力でも、未収録名・prototype名・非対応サイズ・name欠落を明示的に拒否する。
test('存在しない公開名と非対応サイズは日本語エラーになる', async () => {
  expect(isIconName('bell')).toBe(true);
  for (const name of ['missing', 'logo', '__proto__', 'toString']) {
    expect(isIconName(name)).toBe(false);
    const error = await render({ name: name as IconName }).catch(error => error);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain(`存在しないアイコン公開名: ${name}`);
  }
  const sizeError = await render({ name: 'bell', size: 18 }).catch(error => error);
  expect(sizeError).toBeInstanceOf(Error);
  expect(sizeError.message).toContain('16/20/24/32px');
  const missingError = await render({}).catch(error => error);
  expect(missingError).toBeInstanceOf(Error);
  expect(missingError.message).toContain('存在しないアイコン公開名: undefined');
});

// 追加属性やslotで形状・読み上げ属性を上書きできず、classとトークン色だけを指定できる。
test('色とclassを指定でき、SVG属性・操作・slotは転送しない', async () => {
  const html = await container.renderToString(TIcon, {
    props: { name: 'bell', class: 'notification-icon selected', color: 'var(--tkw-color-primary-blue-on)',
      width: 99, viewBox: '0 0 99 99', 'aria-hidden': false, focusable: true,
      tabindex: 0, id: 'external', style: 'color:red', onclick: 'alert(1)', role: 'img', 'aria-label': '上書き' },
    slots: { default: '<title>挿入</title>' },
  });
  expect(html).toContain('class="notification-icon selected"');
  expect(html).toContain('color:var(--tkw-color-primary-blue-on)');
  expect(html).toContain('width="24" height="24"');
  expect(html).toContain('viewBox="0 0 32 32"');
  expect(html).toContain('aria-hidden="true" focusable="false"');
  expect(html).not.toMatch(/tabindex|external|onclick|上書き|挿入|color:red|role=/);
  expect(await render({ name: 'bell' })).toContain('color:currentColor');
  expect(await render({ name: 'bell', class: '" onload="alert(1)' })).toContain('&quot;');
});

// 公開入口を実際にバンドルし、原本の収録を確認しながら資料や他フレームワークの混入を検出する。
test('Astroの公開入口にREADME・Storybook・React・Vueランタイムは含まれない', async () => {
  const loaded: string[] = [];
  const result = await Bun.build({
    entrypoints: [new URL('./index.ts', import.meta.url).pathname],
    external: ['astro/compiler-runtime'],
    plugins: [{ name: 'astro-import-audit', setup(build) {
      build.onResolve({ filter: /\.svg\?raw$/ }, args => ({ path: resolve(args.resolveDir, args.path.slice(0, -4)), namespace: 'raw-svg' }));
      build.onLoad({ filter: /.*/, namespace: 'raw-svg' }, args => {
        loaded.push(args.path);
        return { contents: readFileSync(args.path, 'utf8'), loader: 'text' };
      });
      build.onLoad({ filter: /\.astro$/ }, async args => {
        loaded.push(args.path);
        return { contents: (transform(await Bun.file(args.path).text(), {
          filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
        })).code, loader: 'js' };
      });
      build.onLoad({ filter: /.*/ }, args => { loaded.push(args.path); return undefined; });
    } }],
  });
  expect(result.success).toBe(true);
  expect(loaded.some(path => path.includes('/icons/bell/bell.svg'))).toBe(true);
  expect(loaded.some(path => /README|\/stories\/|\/react\/|\/vue\/|\/node_modules\/(react|vue)\//.test(path))).toBe(false);
});
