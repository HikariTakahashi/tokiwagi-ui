import { expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { isBrandAssetName } from './icon-assets';

const stories = new URL('../stories/', import.meta.url);
const detailDirectory = new URL('../icons/', stories);
const files = readdirSync(detailDirectory).filter(name => name.endsWith('.mdx') && !isBrandAssetName(name.slice(0, -4))).sort();
const details = files.map(file => ({
  name: file.slice(0, -4),
  source: readFileSync(new URL(file, detailDirectory), 'utf8'),
}));
const catalog = readFileSync(new URL('icons.mdx', stories), 'utf8');
const assets = new URL('../../icons/', import.meta.url);
const names = readdirSync(assets, { withFileTypes: true }).filter(entry => entry.isDirectory() && !isBrandAssetName(entry.name)).map(entry => entry.name).sort();
const readmes = new Map(names.map(name => [name, readFileSync(new URL(`${name}/README.md`, assets), 'utf8')]));

// 制作済み329図柄の原本と個別ページを突き合わせ、欠落・重複・孤立ページを検出する。
test('全329アイコンの原本と個別ページが一対一に対応する', () => {
  expect(names).toHaveLength(329);
  expect(files).toHaveLength(329);
  expect(names).toEqual(details.map(detail => detail.name).sort());
  expect(catalog).toContain('<IconBrowser />');
  for (const { name, source } of details) {
    expect(source).toContain(`<IconPreview name="${name}" />`);
    expect(source).toContain(`import readme from '../../icons/${name}/README.md?raw';`);
    expect(source).toContain('<Markdown>{readme}</Markdown>');
    expect(readFileSync(new URL(`${name}/${name}.svg`, assets), 'utf8')).toContain('viewBox="0 0 32 32"');
  }
});

// 全個別ページで指定の6セクションを同じ順序で提供し、本文・ファイル情報・戻り先を欠落させない。
test('各アイコンに指定された6セクションと識別情報がある', () => {
  const sections = ['概要', '使用場面', '状態の表し方', '使用しない場面', '表示とアクセシビリティ', '関連アイコンと使い分け'];
  for (const { name, source } of details) {
    const readme = readmes.get(name)!;
    expect(source).toContain(`id="icons-${name}"`);
    expect(readme).toContain(`ファイル：\`${name}.svg\``);
    expect(source).toContain('[アイコン一覧へ戻る](?path=/docs/アイコン-アイコン名および用途--docs)');
    const headings = [...readme.matchAll(/^## (.+)$/gm)].map(match => match[1]);
    expect(headings).toEqual(sections);
    for (const body of readme.split(/^## .+$/m).slice(1)) {
      expect(body.trim().length).toBeGreaterThan(0);
    }
  }
});

// 関連図柄・移行資料・統合TIcon資料・一覧の内部リンク先を照合し、存在しないIDへの導線を防ぐ。
test('アイコン資料の内部リンクに存在しないページがない', () => {
  const ids = new Set([
    'アイコン-アイコン名および用途--docs',
    'アイコン-命名基準--docs',
    'icons-migration--docs',
    'icons-display--docs',
    'components-ticon--docs',
    'brand-logo--docs',
    ...details.map(detail => `icons-${detail.name}--docs`),
  ]);
  const sources = [catalog, ...details.map(detail => detail.source), ...readmes.values(),
    readFileSync(new URL('icon-naming.mdx', stories), 'utf8'),
    readFileSync(new URL('icon-migration.mdx', stories), 'utf8'),
    readFileSync(new URL('icon-display.mdx', stories), 'utf8'),
    readFileSync(new URL('TIcon.mdx', stories), 'utf8'),
    readFileSync(new URL('components/TIconDocumentation.tsx', stories), 'utf8')];
  expect(sources.at(-2)).toContain('id="components-ticon"');
  for (const source of sources) {
    for (const match of source.matchAll(/(?:\]\(|href="(?:\.\/)?)[?]path=\/docs\/([^\s)"]+)/g)) {
      expect(ids.has(match[1]!)).toBe(true);
    }
  }
});
