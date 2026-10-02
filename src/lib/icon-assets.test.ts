import { describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { createIconCatalog, filterIcons, iconCategories, iconSizes, originalIconUrl, renderIconSvg } from './icon-assets';

const directory = new URL('../../icons/', import.meta.url);
const sources = Object.fromEntries(readdirSync(directory).filter(file => file.endsWith('.svg')).map(file => [file, readFileSync(new URL(file, directory), 'utf8')]));
const catalog = createIconCatalog(sources);

// 既存6分類と全個別ページの分類を照合し、図柄の移動・欠落とリンクの不整合を検出する。
test('原本329個が既存の分類と個別ページに対応する', () => {
  expect(catalog).toHaveLength(329);
  expect(iconCategories.map(([key]) => catalog.filter(icon => icon.category === key).length)).toEqual([132, 40, 40, 38, 39, 40]);
  for (const icon of catalog) {
    const detail = readFileSync(new URL(`../stories/icons/${icon.name}.mdx`, import.meta.url), 'utf8');
    const label = iconCategories.find(([key]) => key === icon.category)![1];
    expect(detail).toContain(`title="アイコン/個別ルール/${label}/${icon.name}"`);
    expect(icon.href).toBe(`?path=/docs/icons-${icon.name}--docs`);
  }
});

// 名前検索と分類を組み合わせ、空白・大文字・該当なし・全件への復帰を確認する。
test('検索と分類で目的の図柄を絞り込める', () => {
  expect(filterIcons(catalog, ' BELL ', 'calendar').map(icon => icon.name)).toEqual(['calendar-bell']);
  expect(filterIcons(catalog, 'bell', 'basic').map(icon => icon.name)).toEqual(['bell', 'bell-off']);
  expect(filterIcons(catalog, 'not-an-icon', 'all')).toHaveLength(0);
  expect(filterIcons(catalog, '', 'all')).toHaveLength(329);
});

// 全原本で変換前後の座標・線幅・角・viewBoxを照合し、色変更による変形やfill=noneの喪失を防ぐ。
test('全図形の形状を維持し、線と塗りだけを着色可能にする', () => {
  const geometry = (svg: string) => svg.match(/\b(?:d|viewBox|stroke-width|stroke-linecap|stroke-linejoin|fill-rule|clip-rule)="[^"]*"/g);
  for (const icon of catalog) {
    const rendered = renderIconSvg(icon.svg, `test-${icon.name}`);
    expect(geometry(rendered)).toEqual(geometry(icon.svg));
    expect(rendered).not.toMatch(/(?:stroke|fill)="black"/);
    expect(rendered.match(/currentColor/g)?.length).toBe(icon.svg.match(/(?:stroke|fill)="black"/g)?.length);
    expect(rendered.match(/fill="none"/g)?.length).toBe(icon.svg.match(/fill="none"/g)?.length);
    expect(rendered.match(/fill="white"/g)?.length).toBe(icon.svg.match(/fill="white"/g)?.length);
    expect(rendered).toContain('aria-hidden="true" focusable="false"');
  }
});

describe('クリッピングと複数表示', () => {
  // 同一図柄を4サイズで同時に表示しても、IDが一意で参照先が各SVG内に存在することを確認する。
  test('moonとtoolの参照は表示インスタンス間で衝突しない', () => {
    const allIds: string[] = [];
    for (const name of ['moon', 'tool']) for (const size of iconSizes) {
      const rendered = renderIconSvg(sources[`${name}.svg`]!, `${name}-${size}`, size);
      const ids = [...rendered.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]!);
      allIds.push(...ids);
      expect(ids).toHaveLength(1);
      for (const match of rendered.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(match[1]!);
      expect(rendered).toContain(`width="${size}" height="${size}"`);
      expect(rendered).toContain('<rect width="32" height="32" fill="white"/>');
    }
    expect(new Set(allIds).size).toBe(8);
  });
});

// ダウンロード先の名前と配置を照合し、全329個で色・サイズ変更前の原本を参照することを確認する。
test('ダウンロードは全329個の原本SVGをそのまま返す', () => {
  for (const icon of catalog) {
    const url = originalIconUrl(icon);
    expect(url).toBe(`./icons/${icon.name}.svg`);
    expect(readFileSync(new URL(`../../${url}`, import.meta.url), 'utf8')).toBe(icon.svg);
  }
});

// HTMLへの埋め込みに使う原本に外部参照や実行可能な要素が混入しないことを確認する。
test('収録SVGは図形とクリッピング要素のみを含む', () => {
  const allowed = new Set(['svg', 'path', 'g', 'defs', 'clipPath', 'rect']);
  for (const icon of catalog) {
    for (const tag of icon.svg.matchAll(/<\/?([a-zA-Z][\w-]*)\b/g)) expect(allowed.has(tag[1]!)).toBe(true);
    expect(icon.svg).not.toMatch(/\s(?:on\w+|href|xlink:href|style)\s*=/i);
    expect(icon.svg).not.toMatch(/<!|<\?/);
    for (const ref of icon.svg.matchAll(/url\(([^)]+)\)/g)) expect(ref[1]).toMatch(/^#[\w-]+$/);
  }
});

// 不正名・重複名・viewBox違いを黙って収録せず、原因を特定できるエラーにする。
test('不正な原本を収録時に検出する', () => {
  expect(() => createIconCatalog({ 'wrong_name.svg': sources['bell.svg']! })).toThrow('不正');
  expect(() => createIconCatalog({ 'a/bell.svg': sources['bell.svg']!, 'b/bell.svg': sources['bell.svg']! })).toThrow('重複');
  expect(() => createIconCatalog({ 'bell.svg': '<svg />' })).toThrow('viewBox');
});
