import { expect, test } from 'bun:test';
import { headerBackgroundColors, headerBackgroundState, type HeaderBackgroundColor } from './header-background';
import { headerTones } from './header';
import { contrast, parseTokens, parseNeutralTokens, parseSecondaryTokens, parseSemanticTokens } from './palette';
import primary from '../../tokens/colors.css?raw';
import secondary from '../../tokens/secondary.css?raw';
import semantic from '../../tokens/semantic.css?raw';
import neutral from '../../tokens/neutrals.css?raw';
const tokens = { ...parseTokens(primary), ...parseSecondaryTokens(secondary), ...parseSemanticTokens(semantic), ...parseNeutralTokens(neutral) };
const token = (value: string) => value.slice(4, -1);

// CSS原本の93種類すべてを選べ、通常の文字と全toneの文字が4.5:1以上になる。
test('ヘッダーの全背景色はCSS原本と一致し、読みやすい前景色を選ぶ', () => {
  expect(headerBackgroundColors).toHaveLength(93);
  expect(new Set(headerBackgroundColors).size).toBe(93);
  expect(Object.keys(tokens).sort()).toEqual([...headerBackgroundColors].sort());
  for (const backgroundColor of headerBackgroundColors) {
    const state = headerBackgroundState(backgroundColor);
    expect(state.backgroundColor).toBe(backgroundColor);
    expect(state.style['--tkw-header-background']).toBe(`var(${backgroundColor})`);
    expect(contrast(tokens[backgroundColor]!, tokens[state.foreground]!)).toBeGreaterThanOrEqual(4.5);
    for (const tone of headerTones) {
      const actual = token(state.style[`--tkw-header-readable-${tone}`]!);
      expect(contrast(tokens[backgroundColor]!, tokens[actual]!)).toBeGreaterThanOrEqual(4.5);
      const original = tone === 'neutral' ? '--tkw-color-neutral-900' : `--tkw-color-primary-${tone}-on-subtle`;
      if (contrast(tokens[backgroundColor]!, tokens[original]!) >= 4.5) expect(actual).toBe(original);
    }
  }
});

// 未指定は従来の白背景と濃い文字になり、任意値・プロトタイプ名・nullは受け付けない。
test('ヘッダーの背景色は白を既定とし、不正な入力を日本語で拒否する', () => {
  expect(headerBackgroundState().backgroundColor).toBe('--tkw-color-neutral-0');
  expect(headerBackgroundState().foreground).toBe('--tkw-color-neutral-900');
  expect(headerBackgroundState('--tkw-color-neutral-1000').foreground).toBe('--tkw-color-neutral-0');
  for (const value of ['#FFFFFF', 'white', 'var(--tkw-color-neutral-0)', '--tkw-color-primary-red', '', 'toString', null, 1]) {
    expect(() => headerBackgroundState(value as HeaderBackgroundColor)).toThrow('THeaderのbackgroundColorには既存の93カラートークン名を指定してください');
  }
});
