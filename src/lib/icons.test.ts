import { expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';

const stories = new URL('../stories/', import.meta.url);
const detailDirectory = new URL('icons/', stories);
const files = readdirSync(detailDirectory).filter(name => name.endsWith('.mdx')).sort();
const details = files.map(file => ({
  name: file.slice(0, -4),
  source: readFileSync(new URL(file, detailDirectory), 'utf8'),
}));
const catalog = readFileSync(new URL('icons.mdx', stories), 'utf8');
const assets = new URL('../../icons/', import.meta.url);
const names = readdirSync(assets).filter(name => name.endsWith('.svg')).map(name => name.slice(0, -4)).sort();

// 制作済み329図柄の原本と個別ページを突き合わせ、欠落・重複・孤立ページを検出する。
test('全329アイコンの原本と個別ページが一対一に対応する', () => {
  expect(names).toHaveLength(329);
  expect(files).toHaveLength(329);
  expect(names).toEqual(details.map(detail => detail.name).sort());
  expect(catalog).toContain('<IconBrowser />');
  for (const { name, source } of details) {
    expect(source).toContain(`<IconPreview name="${name}" />`);
  }
});

// 全個別ページで指定の6セクションを同じ順序で提供し、本文・ファイル情報・戻り先を欠落させない。
test('各アイコンに指定された6セクションと識別情報がある', () => {
  const sections = ['概要', '使用場面', '状態の表し方', '使用しない場面', '表示とアクセシビリティ', '関連アイコンと使い分け'];
  for (const { name, source } of details) {
    expect(source).toContain(`id="icons-${name}"`);
    expect(source).toContain(`ファイル：\`${name}.svg\``);
    expect(source).toContain('[アイコン一覧へ戻る](?path=/docs/アイコン-アイコン名および用途--docs)');
    const headings = [...source.matchAll(/^## (.+)$/gm)].map(match => match[1]);
    expect(headings).toEqual(sections);
    for (const body of source.split(/^## .+$/m).slice(1)) {
      expect(body.replace('</div>', '').trim().length).toBeGreaterThan(0);
    }
  }
});

// 関連図柄・移行資料・一覧の内部リンク先を照合し、未収録図柄や存在しないIDへの導線を防ぐ。
test('アイコン資料の内部リンクに存在しないページがない', () => {
  const ids = new Set([
    'アイコン-アイコン名および用途--docs',
    'アイコン-命名基準--docs',
    'icons-migration--docs',
    'icons-display--docs',
    ...details.map(detail => `icons-${detail.name}--docs`),
  ]);
  const sources = [catalog, ...details.map(detail => detail.source),
    readFileSync(new URL('icon-naming.mdx', stories), 'utf8'),
    readFileSync(new URL('icon-migration.mdx', stories), 'utf8'),
    readFileSync(new URL('icon-display.mdx', stories), 'utf8')];
  for (const source of sources) {
    for (const match of source.matchAll(/\]\(\?path=\/docs\/([^\s)]+)\)/g)) {
      expect(ids.has(match[1]!)).toBe(true);
    }
  }
});
