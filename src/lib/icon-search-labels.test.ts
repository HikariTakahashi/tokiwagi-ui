import { expect, test } from 'bun:test';
import { parseIconSearchLabels } from './icon-search-labels';

// 概要の別名行だけを読み、本文や関連アイコンなどを検索語として混入させない。
test('概要に記載した別名だけを抽出する', () => {
  const source = '## 概要\n\n対象への好意を表す。\n\n別名：`heart`、` ハート `\n\n## 使用場面\n\n`bookmark`\n別名：`検索対象外`';
  expect(parseIconSearchLabels(source, 'like')).toEqual(['heart', 'ハート']);
  expect(parseIconSearchLabels(source.replaceAll('\n', '\r\n'), 'like')).toEqual(['heart', 'ハート']);
});

// 別名がない・重複行・不正な区切り・空文字などを黙って無視せず、対象名付きのエラーにする。
test('欠落や不正な別名行はアイコン名付きで検出する', () => {
  for (const line of ['', '別名：', '別名：heart', '別名:`heart`', '別名：``', '別名：`heart`、', '別名：`heart`, `ハート`', '別名：`heart`\n別名：`ハート`', '別名：`   `', '別名：`heart`、`HEART`', '別名：`ハート`、`ハート`']) {
    expect(() => parseIconSearchLabels(`## 概要\n\n${line}\n\n## 使用場面\n`, 'like')).toThrow('like');
  }
  expect(() => parseIconSearchLabels('## 使用場面\n\n別名：`heart`', 'like')).toThrow('like');
});
