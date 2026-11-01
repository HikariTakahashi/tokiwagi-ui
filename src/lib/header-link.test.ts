import { expect, test } from 'bun:test';
import { headerLinkState } from './header-link';
import { headerButtonState } from './header';

// activeの既定値・更新・不正値を両部品で検証し、選択状態は別に保持する。
test('ヘッダーのactiveはbooleanで指定し、選択状態に影響しない', () => {
  for (const active of [undefined, false, true]) {
    expect(headerButtonState({ active }).active).toBe(active === true);
    expect(headerButtonState({ active }).selected).toBeUndefined();
    expect(headerLinkState({ href: '/', active }).active).toBe(active === true);
    expect(headerLinkState({ href: '/', active }).selected).toBe(false);
    expect(headerButtonState({ active, selected: true }).selected).toBe(true);
    expect(headerLinkState({ href: '/', active, 'aria-current': 'page' }).selected).toBe(true);
  }
  for (const active of [null, 'true', 1]) {
    expect(() => headerButtonState({ active: active as never })).toThrow('activeにはboolean');
    expect(() => headerLinkState({ href: '/', active: active as never })).toThrow('activeにはboolean');
  }
});

// 型を迂回したhrefと外観設定を拒否し、リンクの生成条件を全方式で共通化する。
test('ヘッダーリンクは必須hrefと外観設定を検証する', () => {
  for (const href of [undefined, null, '', '  ', '\n', 123]) {
    expect(() => headerLinkState({ href: href as string })).toThrow('hrefには空白だけではない文字列');
  }
  for (const href of ['/settings', 'https://example.com/help?q=予定#top', '#section']) {
    expect(headerLinkState({ href }).href).toBe(href);
  }
  expect(() => headerLinkState({ href: '/', tone: 'red' as never })).toThrow('tone');
  expect(() => headerLinkState({ href: '/', iconOnly: 'yes' as never })).toThrow('iconOnly');
});

// 新規タブだけでopenerを除去し、既存のrelと参照元の送信方針を維持する。
test('ヘッダーリンクは別タブのrelだけを補完する', () => {
  expect(headerLinkState({ href: '/', target: '_blank' }).rel).toBe('noopener');
  expect(headerLinkState({ href: '/', target: '_BLANK', rel: 'external OPENER NoOpener noreferrer' }).rel).toBe('external noreferrer noopener');
  expect(headerLinkState({ href: '/', target: '_blank', rel: 'nofollow' }).rel).toBe('nofollow noopener');
  expect(headerLinkState({ href: '/', target: '_self', rel: 'opener external' }).rel).toBe('opener external');
  expect(headerLinkState({ href: '/' }).rel).toBeUndefined();
});

// booleanと文字列のaria-currentを解釈し、未指定・falseを現在地として表示しない。
test('ヘッダーリンクの現在地はaria-currentから解決する', () => {
  for (const current of [undefined, false, 'false'] as const) {
    expect(headerLinkState({ href: '/', 'aria-current': current }).selected).toBe(false);
  }
  for (const current of [true, 'true', 'page', 'location', 'step', 'date', 'time'] as const) {
    expect(headerLinkState({ href: '/', 'aria-current': current }).selected).toBe(true);
  }
});
