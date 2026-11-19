import { expect, test } from 'bun:test';
import { buttonState, buttonTones, type ButtonOptions } from './button';
import { buttonSizes } from './button-size';

// 全方式で同じ既定値と許可値を使い、型を迂回した不正設定を描画前に検出する。
test('TButtonは8色と3種類のtypeを受け付け、不正な設定を拒否する', () => {
  expect(buttonState()).toEqual({ tone: 'neutral', type: 'button', disabled: false,
    leadingIcon: undefined, trailingIcon: undefined, size: 'lg', iconSize: 32 });
  for (const tone of buttonTones) {
    for (const type of ['button', 'submit', 'reset'] as const) {
      expect(buttonState({ tone, type, leadingIcon: 'save', disabled: true })).toEqual({
        tone, type, leadingIcon: 'save', trailingIcon: undefined, disabled: true, size: 'lg', iconSize: 32,
      });
    }
  }
  for (const [name, value] of [
    ['tone', 'red'], ['type', 'link'], ['disabled', 'false'], ['leadingIcon', 'missing-icon'], ['trailingIcon', 'missing-icon'],
  ]) {
    expect(() => buttonState({ [name!]: value } as ButtonOptions)).toThrow();
  }
});

// サイズ・前後アイコンを独立に解決し、外部入力の不正なサイズを既定値に置換せず検出する。
test('TButtonは3サイズと前後の任意アイコンを検証する', () => {
  for (const [index, size] of buttonSizes.entries()) {
    for (const leadingIcon of [undefined, 'moon'] as const) {
      for (const trailingIcon of [undefined, 'tool'] as const) {
        expect(buttonState({ size, leadingIcon, trailingIcon })).toMatchObject({
          size, iconSize: [20, 24, 32][index], leadingIcon, trailingIcon,
        });
      }
    }
  }
  for (const size of ['inherit', 'xl', '', null, 16, {}, []]) {
    expect(() => buttonState({ size } as ButtonOptions)).toThrow('TButtonのsize');
  }
});
