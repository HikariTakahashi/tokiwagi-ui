import { expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToString } from 'react-dom/server';
import { TIcon, iconNames, isIconName, type IconName, type IconSize } from 'tokiwagi-ui/react';
import { iconSources } from '../lib/icon-sources';
import { iconSizes } from '../lib/icon-assets';

const render = (name: IconName, size: IconSize = 24) => renderToString(<TIcon name={name} size={size} />);
const geometry = (svg: string) => svg.match(/\b(?:d|viewBox|stroke-width|stroke-linecap|stroke-linejoin|fill-rule|clip-rule)="[^"]*"/g);

// 原本の追加・削除・差し替え後も、両フレームワークで共有する公開名とraw importが全329原本に一致する。
test('Reactの公開名と読み込むSVGは全原本と一致する', () => {
  const directory = new URL('../../icons/', import.meta.url);
  expect<readonly string[]>(iconNames).toEqual(readdirSync(directory).sort());
  expect(iconNames).toHaveLength(329);
  for (const name of iconNames) expect(iconSources[name]).toBe(readFileSync(new URL(`${name}/${name}.svg`, directory), 'utf8'));
});

// 全図柄を4サイズで実際にSSRし、原本の座標・線幅・白いクリッピング・透明な塗りを保持する。
test('Reactコンポーネントは全原本の形状を4サイズで維持する', () => {
  for (const name of iconNames) for (const size of iconSizes) {
    const svg = render(name, size);
    const source = iconSources[name];
    expect(geometry(svg)).toEqual(geometry(source));
    expect(svg).toContain(`width="${size}" height="${size}"`);
    expect(svg).not.toMatch(/(?:fill|stroke)="black"/);
    expect(svg.match(/currentColor"/g)?.length).toBe(source.match(/(?:fill|stroke)="black"/g)?.length);
    for (const fill of ['none', 'white']) expect(svg.match(new RegExp(`fill="${fill}"`, 'g'))?.length).toBe(source.match(new RegExp(`fill="${fill}"`, 'g'))?.length);
  }
});

// 同じ図柄を繰り返しSSRし、各参照が自分のSVG内を指し、同条件でのSSRが同じIDになる。
test('moonとtoolの複数表示とSSRでIDの衝突や揺れが起きない', () => {
  const page = () => renderToString(<div>{(['moon', 'tool'] as const).flatMap(name => iconSizes.map(size =>
    <TIcon key={`${name}-${size}`} name={name} size={size} />
  ))}</div>, { identifierPrefix: '画面:一' });
  const html = page();
  expect(page()).toBe(html);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]!);
  expect(new Set(ids).size).toBe(8);
  for (const svg of html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) {
    const id = svg[0].match(/\bid="([^"]+)"/)![1];
    expect(id).toMatch(/^tkw-react-[\w-]+$/);
    expect(svg[0]).toContain(`url(#${id})`);
  }
});

// JSや外部入力で型を迂回しても、未収録名・prototype名・非対応サイズを明示的に拒否する。
test('存在しない公開名と非対応サイズは日本語エラーになる', () => {
  expect(isIconName('bell')).toBe(true);
  for (const name of ['missing', '__proto__', 'toString']) {
    expect(isIconName(name)).toBe(false);
    expect(() => render(name as IconName)).toThrow(`存在しないアイコン公開名: ${name}`);
  }
  expect(() => render('bell', 18 as IconSize)).toThrow('16/20/24/32px');
  expect(() => renderToString(<TIcon {...{} as { name: IconName }} />)).toThrow('存在しないアイコン公開名: undefined');
});

// 最小公開API以外の入力でサイズ・形状・読み上げ属性を上書きできず、操作名は親に保持される。
test('色とclassNameを指定でき、SVG属性・操作・childrenは転送しない', () => {
  const extra = {
    'aria-hidden': false, focusable: true, tabIndex: 0, width: 99, height: 99, viewBox: '0 0 99 99',
    style: { color: 'red', width: 99 }, id: 'external', 'data-test': 'external',
    onClick: () => {}, children: '通知', dangerouslySetInnerHTML: { __html: '<title>上書き</title>' },
  };
  const html = renderToString(<button type="button" aria-label="通知一覧を開く">
    <TIcon {...extra} name="bell" color="var(--tkw-color-primary-blue-on)" className="notification-icon selected" />
  </button>);
  expect(html).toContain('aria-label="通知一覧を開く"');
  expect(html).toContain('class="notification-icon selected"');
  expect(html).toContain('color:var(--tkw-color-primary-blue-on)');
  expect(html).toContain('aria-hidden="true" focusable="false"');
  expect(html).toContain('width="24" height="24"');
  expect(html).toContain('viewBox="0 0 32 32"');
  expect(html).not.toMatch(/tabindex|external|上書き|color:red/);
  expect(html).toContain('<path');
  expect(render('bell')).toContain('color:currentColor');
});

// 公開入口を実際にバンドルし、原本を収録してもREADME本文・Storybook・Vueランタイムを読み込まない。
test('Reactの公開入口に資料用コードやVueランタイムは含まれない', async () => {
  const loaded: string[] = [];
  const result = await Bun.build({
    entrypoints: [new URL('./index.ts', import.meta.url).pathname],
    external: ['react', 'react/jsx-runtime'],
    plugins: [{ name: 'import-audit', setup(build) {
      // BunのバンドラではViteの?rawを明示的にテキストloaderへ対応付ける。
      build.onResolve({ filter: /\.svg\?raw$/ }, args => ({ path: resolve(args.resolveDir, args.path.slice(0, -4)), namespace: 'raw-svg' }));
      build.onLoad({ filter: /.*/, namespace: 'raw-svg' }, args => {
        loaded.push(args.path);
        return { contents: readFileSync(args.path, 'utf8'), loader: 'text' };
      });
      build.onLoad({ filter: /.*/ }, args => { loaded.push(args.path); return undefined; });
    } }],
  });
  expect(result.success).toBe(true);
  expect(loaded.some(path => path.includes('/icons/bell/bell.svg'))).toBe(true);
  expect(loaded.some(path => /README|\/stories\/|\/vue\/|\/node_modules\/vue\//.test(path))).toBe(false);
});
