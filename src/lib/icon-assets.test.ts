import { describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { createIconCatalog, filterIcons, iconCategories, iconSizes, originalIconUrl, renderIconSvg } from './icon-assets';

const directory = new URL('../../icons/', import.meta.url);
const names = readdirSync(directory).filter(name => readdirSync(new URL(`${name}/`, directory)).includes(`${name}.svg`));
const sources = Object.fromEntries(names.map(name => [`${name}/${name}.svg`, readFileSync(new URL(`${name}/${name}.svg`, directory), 'utf8')]));
const documents = Object.fromEntries(names.map(name => [`${name}/README.md`, readFileSync(new URL(`${name}/README.md`, directory), 'utf8')]));
const catalog = createIconCatalog(sources, documents);

// 既存6分類と全個別ページの分類を照合し、図柄の移動・欠落とリンクの不整合を検出する。
test('原本329個が既存の分類と個別ページに対応する', () => {
  expect(catalog).toHaveLength(329);
  expect(iconCategories.map(([key]) => catalog.filter(icon => icon.category === key).length)).toEqual([132, 40, 40, 38, 39, 40]);
  for (const icon of catalog) {
    const detail = readFileSync(new URL(`../icons/${icon.name}.mdx`, import.meta.url), 'utf8');
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

// 英語・日本語の別名と部分一致を使い、基本形・派生形の検索と分類の併用を確認する。
test('公開名を知らなくても別名で基本形と派生形を検索できる', () => {
  const likes = ['calendar-like', 'circle-like', 'like', 'like-off', 'square-like', 'task-like', 'triangle-like'];
  for (const query of ['heart', ' HEART ', 'favorite', 'ハート', 'いいね', 'お気に入り', 'hear']) {
    expect(filterIcons(catalog, query, 'all').map(icon => icon.name)).toEqual(likes);
  }
  expect(filterIcons(catalog, 'heart', 'calendar').map(icon => icon.name)).toEqual(['calendar-like']);
  expect(filterIcons(catalog, 'ハート', 'basic').map(icon => icon.name)).toEqual(['like', 'like-off']);
  expect(filterIcons(catalog, 'heart calendar', 'all')).toHaveLength(0);
  expect(filterIcons(catalog, '   ', 'all')).toEqual(catalog);
  expect(filterIcons(catalog, '', 'circle')).toEqual(catalog.filter(icon => icon.category === 'circle'));
});

// 全READMEの別名行と実際の検索対象を照合し、登録漏れや読み込み時の別名の脱落を防ぐ。
test('全329件でREADMEに記載した英語と日本語の別名が検索に使われる', () => {
  for (const icon of catalog) {
    const line = documents[`${icon.name}/README.md`]!.split('\n').find(line => line.startsWith('別名：'))!;
    const labels = [...line.matchAll(/`([^`]+)`/g)].map(match => match[1]);
    expect(icon.searchLabels).toEqual(labels);
    expect(icon.searchLabels.some(label => /[a-z]/i.test(label))).toBe(true);
    expect(icon.searchLabels.some(label => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(label))).toBe(true);
    for (const label of icon.searchLabels) expect(filterIcons(catalog, label, 'all')).toContain(icon);
  }
});

// READMEの別名だけを変更した場合、別の辞書を修正せず新しい検索語がカタログへ反映される。
test('別名の管理元は個別READMEだけである', () => {
  const documents = { 'like/README.md': '## 概要\n\n別名：`CustomHeart`、`独自の別名`\n\n## 使用場面\n' };
  const icons = createIconCatalog({ 'like/like.svg': sources['like/like.svg']! }, documents);
  expect(filterIcons(icons, 'customheart', 'all').map(icon => icon.name)).toEqual(['like']);
  expect(filterIcons(icons, '独自の別名', 'all').map(icon => icon.name)).toEqual(['like']);
  expect(filterIcons(icons, 'favorite', 'all')).toHaveLength(0);
});

// ディレクトリ名でSVGとREADMEを対応付け、欠落・孤立・重複をアイコン名付きで検出する。
test('SVGとREADMEの対応が不正なときは原因を特定できる', () => {
  const source = { 'bell/bell.svg': sources['bell/bell.svg']! };
  expect(() => createIconCatalog(source, {})).toThrow('個別READMEがありません: bell');
  expect(() => createIconCatalog({}, { 'bell/README.md': documents['bell/README.md']! })).toThrow('原本SVGがありません: bell');
  expect(() => createIconCatalog(source, { 'a/bell/README.md': '', 'b/bell/README.md': '' })).toThrow('重複しています: bell');
  expect(() => createIconCatalog(source, { 'bell/README.md': '## 概要\n\n本文のみ' })).toThrow('別名行が欠落または不正です: bell');
  expect(() => createIconCatalog({ 'other/bell.svg': sources['bell/bell.svg']! }, {})).toThrow('配置先');
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
      const rendered = renderIconSvg(sources[`${name}/${name}.svg`]!, `${name}-${size}`, size);
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
    expect(url).toBe(`./icon-assets/${icon.name}/${icon.name}.svg`);
    expect(readFileSync(new URL(`../../icons/${icon.name}/${icon.name}.svg`, import.meta.url), 'utf8')).toBe(icon.svg);
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
  expect(() => createIconCatalog({ 'wrong_name/wrong_name.svg': sources['bell/bell.svg']! }, documents)).toThrow('不正');
  expect(() => createIconCatalog({ 'a/bell/bell.svg': sources['bell/bell.svg']!, 'b/bell/bell.svg': sources['bell/bell.svg']! }, documents)).toThrow('重複');
  expect(() => createIconCatalog({ 'bell/bell.svg': '<svg />' }, documents)).toThrow('viewBox');
});
