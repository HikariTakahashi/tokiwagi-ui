import { expect, test } from 'bun:test';
import { buttonState, buttonTones, type ButtonOptions } from './button';

// 全方式で同じ既定値と許可値を使い、型を迂回した不正設定を描画前に検出する。
test('TButtonは8色と3種類のtypeを受け付け、不正な設定を拒否する', () => {
  expect(buttonState()).toEqual({ tone: 'neutral', type: 'button', disabled: false, leadingIcon: undefined });
  for (const tone of buttonTones) {
    for (const type of ['button', 'submit', 'reset'] as const) {
      expect(buttonState({ tone, type, leadingIcon: 'save', disabled: true })).toEqual({
        tone, type, leadingIcon: 'save', disabled: true,
      });
    }
  }
  for (const [name, value] of [
    ['tone', 'red'], ['type', 'link'], ['disabled', 'false'], ['leadingIcon', 'missing-icon'],
  ]) {
    expect(() => buttonState({ [name!]: value } as ButtonOptions)).toThrow();
  }
});
