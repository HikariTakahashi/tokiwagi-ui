import { expect, test } from 'bun:test';
import { buttonState, buttonTones, type ButtonOptions } from './button';
import { buttonSizes } from './button-size';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { contrast } from './palette';

// 全方式で同じ既定値と許可値を使い、型を迂回した不正設定を描画前に検出する。
test('TButtonは12色と3種類のtypeを受け付け、不正な設定を拒否する', () => {
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

// 実CSSの詳細度と変数解決を含めて計算し、白背景への白文字などの読みづらい配色を検出する。
test('追加したニュートラルtoneは実CSSで文字コントラストを維持する', async () => {
  const window = new Window();
  try {
    const tokens = readFileSync(new URL('../../tokens/neutrals.css', import.meta.url), 'utf8');
    const css = readFileSync(new URL('../styles/button.css', import.meta.url), 'utf8').replace(/@import[^;]+;/g, '');
    const style = window.document.createElement('style');
    style.textContent = tokens + css;
    window.document.head.append(style);
    for (const tone of ['neutral-0', 'neutral-600', 'neutral-800', 'neutral-900']) {
      const button = window.document.createElement('button');
      button.className = 'tkw-button'; button.dataset.tone = tone;
      window.document.body.append(button);
      const computed = window.getComputedStyle(button);
      expect(contrast(computed.color, computed.backgroundColor)).toBeGreaterThanOrEqual(4.5);
      button.remove();
    }
  } finally { await window.happyDOM.close(); }
});
