import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { logoReadmeForStorybook } from './logo-readme';

// 実際のREADMEをStorybookへ掲載した場合、ローカル文書へのリンクが閲覧可能なページと原本へ向く。
test('ロゴのREADMEはStorybookで使用ルールと関連資料を参照できる', () => {
  const readme = readFileSync(new URL('../../icons/logo/README.md', import.meta.url), 'utf8');
  const rendered = logoReadmeForStorybook(readme);
  expect([...rendered.matchAll(/^## (.+)$/gm)].map(match => match[1])).toEqual([
    '概要', '使用場面', '状態の表し方', '使用しない場面', '表示とアクセシビリティ', '関連アイコンと使い分け',
  ]);
  expect(rendered).toContain('(./icon-assets/logo/logo.svg)');
  expect(rendered).toContain('(./?path=/docs/components-tlogo--docs)');
  expect(rendered).toContain('(./?path=/docs/カラー-使用ルール--docs)');
  for (const name of ['calendar', 'task', 'bell']) expect(rendered).toContain(`(./?path=/docs/icons-${name}--docs)`);
  expect(rendered).not.toMatch(/\]\(\.\.\//);
  expect(rendered).toContain('TokiWa Calendarのフィロソフィー');
  expect(rendered).toContain('最小表示サイズは32×32 CSS px');
});
