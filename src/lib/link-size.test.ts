import { expect, test } from 'bun:test';
import { linkSizeState, linkButtonSizeState, type LinkSize, type LinkButtonSize } from './link-size';

// 未指定では既存のアイコン寸法を維持し、明示サイズには公開済みのTIcon寸法だけを割り当てる。
test('リンクのサイズ設定は既定表示と各サイズのアイコンを維持する', () => {
  expect(linkSizeState()).toEqual({ size: 'inherit', iconSize: 16 });
  expect(linkButtonSizeState()).toEqual({ size: 'lg', iconSize: 32 });
  for (const [size, iconSize] of [['inherit', 16], ['sm', 16], ['md', 16], ['lg', 20]] as const) {
    expect(linkSizeState(size)).toEqual({ size, iconSize });
  }
  for (const [size, iconSize] of [['sm', 20], ['md', 24], ['lg', 32]] as const) {
    expect(linkButtonSizeState(size)).toEqual({ size, iconSize });
  }
});

// 型を迂回した外部入力を既定値へ黙って置換せず、部品名の付いた日本語エラーで拒否する。
test('未対応のリンクサイズとボタンのinherit指定を検出する', () => {
  for (const size of ['xl', '', null, 16, {}, []]) {
    expect(() => linkSizeState(size as LinkSize)).toThrow('TLinkのsize');
    expect(() => linkButtonSizeState(size as LinkButtonSize)).toThrow('TLinkButtonのsize');
  }
  expect(() => linkButtonSizeState('inherit' as LinkButtonSize)).toThrow('TLinkButtonのsize');
});
