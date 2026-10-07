import { beforeAll, expect, test } from 'bun:test';
import { generateAstroPreviews } from '../../../.storybook/astro-previews';
import { astroPreviewSvg, type AstroIconPreviews } from './astro-preview';
import { iconNames, iconSources } from '../../lib/icon-sources';
import { iconSizes } from '../../lib/icon-assets';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

let previews: AstroIconPreviews;
beforeAll(async () => { previews = await generateAstroPreviews(); });

// Storybookと同じNode親プロセスで繰り返し生成し、8192文字を超えるJSONも全件受け取れることを確認する。
test('NodeからAstroプレビューを生成しても大きなJSONが途切れない', async () => {
  const module = new URL('../../../.storybook/astro-previews.ts', import.meta.url).href;
  const script = `
    const { generateAstroPreviews } = await import(${JSON.stringify(module)});
    const results = [];
    for (let i = 0; i < 3; i++) {
      const previews = await generateAstroPreviews();
      results.push({ names: Object.keys(previews).length, sizes: Object.values(previews).map(value => Object.keys(value).length), bytes: JSON.stringify(previews).length });
    }
    console.log(JSON.stringify(results));
  `;
  const { stdout } = await promisify(execFile)('node', ['--experimental-strip-types', '--input-type=module', '-e', script]);
  const results = JSON.parse(stdout) as { names: number; sizes: number[]; bytes: number }[];
  expect(results).toHaveLength(3);
  for (const result of results) {
    expect(result.names).toBe(iconNames.length);
    expect(result.sizes).toEqual(iconNames.map(() => iconSizes.length));
    expect(result.bytes).toBeGreaterThan(8192);
  }
}, 15000);

// Storybookと同じ生成経路で実コンポーネントを描画し、全329公開名×4サイズが原本に対応する。
test('Storybook用Astro出力は全329種×4サイズの形状と装飾属性を保持する', () => {
  expect(Object.keys(previews)).toEqual([...iconNames]);
  const geometry = (svg: string) => svg.match(/\b(?:d|viewBox|stroke-width|stroke-linecap|stroke-linejoin|fill-rule|clip-rule)="[^"]*"/g);
  for (const name of iconNames) {
    expect(Object.keys(previews[name]).map(Number)).toEqual([...iconSizes]);
    for (const size of iconSizes) {
      const html = previews[name][size];
      expect(geometry(html)).toEqual(geometry(iconSources[name]));
      expect(html).toContain(`width="${size}" height="${size}"`);
      expect(html).toContain('aria-hidden="true" focusable="false"');
      expect(html).toContain('color:currentColor');
      expect(html).not.toMatch(/<script|astro-island|(?:fill|stroke)="black"/);
    }
  }
});

// 同じAstro出力を別の見本に再利用しても、自身のSVG内だけを参照し、サイズや形状を変えない。
test('Astro出力の複数表示でIDだけを分離し、原本の形状と出力データを維持する', () => {
  const allIds: string[] = [];
  for (const name of ['moon', 'tool'] as const) for (const size of iconSizes) for (const copy of [0, 1]) {
    const original = previews[name][size];
    const svg = astroPreviewSvg(previews, name, size, `tkw-astro-doc-${name}-${size}-${copy}`);
    const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]!);
    allIds.push(...ids);
    for (const ref of svg.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(ref[1]!);
    const withoutIds = (html: string) => html.replace(/\bid="[^"]+"/g, 'id="ID"').replace(/url\(#[^)]+\)/g, 'url(#ID)');
    expect(withoutIds(svg)).toBe(withoutIds(original));
    expect(previews[name][size]).toBe(original);
  }
  expect(new Set(allIds).size).toBe(allIds.length);
  expect(allIds).toHaveLength(16);
});

// データ欠落・不正な接頭辞・孤立したクリッピング参照は、空のSVGや誤った図柄へ置き換えず検出する。
test('Astroプレビューの不正なデータは明確なエラーになる', () => {
  expect(() => astroPreviewSvg({} as AstroIconPreviews, 'bell', 24, 'test')).toThrow('Astroプレビューがありません: bell / 24px');
  expect(() => astroPreviewSvg(previews, 'bell', 24, '不正')).toThrow('ID接頭辞が不正');
  const broken = { bell: { 24: '<svg><g clip-path="url(#missing)"></g></svg>' } } as AstroIconPreviews;
  expect(() => astroPreviewSvg(broken, 'bell', 24, 'test')).toThrow('参照先がありません: missing');
});
