import { expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { iconOverview } from './icon-overview';

// 管理元の全READMEで公開名の説明を得られ、別名・次のセクションを本文へ混入させない。
test('全アイコンのREADMEから概要を読み出せる', () => {
  const root = new URL('../../icons/', import.meta.url);
  const names = readdirSync(root).filter(name => name !== 'logo');
  expect(names.length).toBe(336);
  for (const name of names) {
    const source = readFileSync(new URL(`${name}/README.md`, root), 'utf8');
    const overview = iconOverview(source, name);
    expect(overview.length).toBeGreaterThan(0);
    expect(overview).not.toContain('別名：');
    expect(overview).not.toContain('##');
  }
});

// 改行形式とMarkdown表記に依存せず、最初の説明段落をプレーンテキストにする。
test('概要の最初の段落だけを表示用テキストにする', () => {
  expect(iconOverview('# bell\r\n## 概要\r\n\r\n別名：`通知`\r\n\r\n**通知**を[`bell`](./bell)で\r\n知らせる。\r\n\r\n補足。\r\n## 使用場面\r\n詳細。', 'bell')).toBe('通知をbellで 知らせる。');
  expect(() => iconOverview('# bell\n## 使用場面\n説明', 'bell')).toThrow('アイコンの概要がありません: bell');
});
