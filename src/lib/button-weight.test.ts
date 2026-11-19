import { expect, test } from 'bun:test';
import { buttonState, type ButtonOptions } from './button';
import { linkButtonState } from './link-button';
import type { LinkButtonOptions } from './link';
import { textWeights } from './text';

// 両部品の未指定は継承に委ね、TTextと同じ4段階を受け付け、不正値を描画前に拒否する。
test('両ボタンの太さは未指定とTText共通の4段階だけを受け付ける', () => {
  for (const weight of [undefined, ...textWeights]) {
    expect(buttonState({ weight }).weight).toBe(weight);
    expect(linkButtonState({ href: '/', weight }).weight).toBe(weight);
  }
  for (const weight of ['inherit', 'bolder', '', null, 400, 700, false, {}, []]) {
    expect(() => buttonState({ weight } as ButtonOptions)).toThrow('TButtonのweight');
    expect(() => linkButtonState({ href: '/', weight } as LinkButtonOptions)).toThrow('TLinkButtonのweight');
  }
});
