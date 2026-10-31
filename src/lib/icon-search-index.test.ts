import { expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateIconSearchIndex } from '../../.storybook/icon-search-index';
import { filterIcons, iconCategories } from './icon-assets';
import { parseIconSearchLabels } from './icon-search-labels';

// 実際の生成経路で329件・6分類・全READMEの別名・リンクを照合し、本文や図形の初期配信を防ぐ。
test('検索索引は原本と一致し、README全文とSVGを含まない', () => {
  const index = generateIconSearchIndex();
  expect(index).toHaveLength(329);
  expect(iconCategories.map(([category]) => index.filter(icon => icon.category === category).length)).toEqual([132, 40, 40, 38, 39, 40]);
  expect(index.some(icon => icon.name === 'logo')).toBe(false);
  for (const icon of index) {
    const readme = readFileSync(new URL(`../../icons/${icon.name}/README.md`, import.meta.url), 'utf8');
    expect(Object.keys(icon).sort()).toEqual(['category', 'href', 'name', 'searchLabels']);
    expect(icon.searchLabels).toEqual(parseIconSearchLabels(readme, icon.name));
    expect(icon.href).toBe(`?path=/docs/icons-${icon.name}--docs`);
    for (const label of icon.searchLabels) expect(filterIcons(index, label, icon.category)).toContain(icon);
  }
  expect(JSON.stringify(index)).not.toMatch(/<svg|## 概要|## 使用場面/);
});

// 別名の編集・追加・削除ごとにファイルを読み直し、手動生成や別辞書なしで索引へ反映する。
test('READMEだけの変更と原本の追加・削除が次の生成で反映される', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tkw-search-index-'));
  try {
    mkdirSync(join(directory, 'like'));
    writeFileSync(join(directory, 'like/like.svg'), '<svg viewBox="0 0 32 32"></svg>');
    const readme = join(directory, 'like/README.md');
    writeFileSync(readme, '## 概要\n\n別名：`heart`、`ハート`\n');
    expect(filterIcons(generateIconSearchIndex(directory), 'heart', 'all')).toHaveLength(1);
    writeFileSync(readme, '## 概要\n\n別名：`CustomHeart`、`独自の別名`\n');
    const updated = generateIconSearchIndex(directory);
    expect(filterIcons(updated, '独自の別名', 'all')).toHaveLength(1);
    expect(filterIcons(updated, 'ハート', 'all')).toHaveLength(0);
    rmSync(join(directory, 'like'), { recursive: true });
    expect(generateIconSearchIndex(directory)).toEqual([]);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
