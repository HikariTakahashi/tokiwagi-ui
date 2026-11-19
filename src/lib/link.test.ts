import { expect, test } from 'bun:test';
import { linkState, type LinkOptions } from './link';

// 空の遷移先や不正な装飾を拒否し、相対URL・フラグメント・プロトコル付きURLを改変しない。
test('TLinkは必須hrefと色・アイコンを3方式で共通に検証する', () => {
  for (const href of [undefined, null, '', ' \n ']) {
    expect(() => linkState({ href } as LinkOptions)).toThrow('TLinkのhref');
  }
  for (const href of ['/予定?日付=今日', '#details', 'https://example.com/', 'mailto:test@example.com']) {
    expect(linkState({ href }).href).toBe(href);
  }
  expect(() => linkState({ href: '/', tone: 'red' } as unknown as LinkOptions)).toThrow('TLinkのtone');
  for (const property of ['leadingIcon', 'trailingIcon']) {
    expect(() => linkState({ href: '/', [property]: 'missing' })).toThrow('存在しないアイコン公開名');
  }
});

// _blankは大文字小文字や重複するopenerにも対処し、既存relと明示的な現在地を維持する。
test('TLinkは別タブのrelを補完し現在地を独立して解決する', () => {
  const options = { href: '/details', target: '_BLANK', rel: 'external OpEnEr NOOPENER noreferrer' };
  expect(linkState(options).rel).toBe('external noreferrer noopener');
  expect(linkState({ href: '/', target: '_blank' }).rel).toBe('noopener');
  expect(linkState({ href: '/', target: '_self', rel: 'external opener' }).rel).toBe('external opener');
  for (const current of [true, 'page', 'location', 'step', 'date', 'time', 'true'] as const) {
    expect(linkState({ href: '/', 'aria-current': current }).isCurrent).toBe(true);
  }
  for (const current of [undefined, false, 'false'] as const) {
    expect(linkState({ href: '/', 'aria-current': current }).isCurrent).toBe(false);
  }
});
