import { expect, test } from 'bun:test';
import type { LinkButtonOptions } from './link';
import { linkButtonState, linkButtonAttributes, stopDisabledLinkActivation } from './link-button';

// TButtonと同じ既定値・boolean検証を使い、無効でも遷移先の設定を検証する。
test('TLinkButtonのdisabledは既定falseで不正な値を拒否する', () => {
  expect(linkButtonState({ href: '/' }).disabled).toBe(false);
  expect(linkButtonState({ href: '/', disabled: true }).disabled).toBe(true);
  for (const disabled of ['false', null, 0]) {
    expect(() => linkButtonState({ href: '/', disabled } as unknown as LinkButtonOptions)).toThrow('TLinkButtonのdisabled');
  }
  expect(() => linkButtonState({ href: ' ', disabled: true })).toThrow('TLinkButtonのhref');
});

// 属性の大小文字やイベント修飾にも対応し、無効時だけ操作属性を除去して通常の説明属性を保持する。
test('TLinkButtonは無効時の遷移・フォーカス・操作イベントを出力しない', () => {
  const attributes = { download: 'file', ping: '/track', tabIndex: 4, autoFocus: true, contenteditable: true,
    onClickCapture: () => {}, onClickOnce: () => {}, onPointerdown: () => {}, onKeyDown: () => {},
    'aria-describedby': 'hint', 'data-kind': 'event', style: { width: '100%' } };
  expect(linkButtonAttributes(attributes, false)).toBe(attributes);
  expect(linkButtonAttributes(attributes, true)).toEqual({ 'aria-describedby': 'hint', 'data-kind': 'event', style: { width: '100%' } });
  expect(attributes.download).toBe('file');
});

// 強制的に送られたクリック・Enter・Spaceを止め、TabやEscapeの標準操作を妨げない。
test('無効なTLinkButtonの操作抑止はクリックと起動キーだけに作用する', () => {
  for (const [type, key, blocked] of [['click', undefined, true], ['auxclick', undefined, true],
    ['keydown', 'Enter', true], ['keyup', ' ', true], ['keydown', 'Tab', false], ['keydown', 'Escape', false]] as const) {
    let prevented = false, stopped = false;
    stopDisabledLinkActivation({ type, key, preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
    expect([prevented, stopped]).toEqual([blocked, blocked]);
  }
});
