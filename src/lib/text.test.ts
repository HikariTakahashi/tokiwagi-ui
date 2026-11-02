import { expect, test } from 'bun:test';
import { invalidTextOptions } from './text-test-helpers';
import { textState, textTones, type TextOptions } from './text';
import { contrast, parseNeutralTokens, parseSemanticTokens } from './palette';

// 省略した設定と明示値を区別し、レスポンシブの欠けた段階は直前の値を引き継ぐ。
test('TTextは既定値・継承・明示した設定・レスポンシブサイズを解決する', () => {
  expect(textState().style).toMatchObject({ '--tkw-text-size-base': '1rem', '--tkw-text-weight': '400', '--tkw-text-line-height': '1.5' });
  expect(textState({ inherit: true }).style).toMatchObject({ '--tkw-text-size-base': 'inherit', '--tkw-text-weight': 'inherit', '--tkw-text-line-height': 'inherit' });
  expect(textState({ inherit: true, size: 'lg', weight: 'bold', lineHeight: 2 }).style)
    .toMatchObject({ '--tkw-text-size-base': '1.125rem', '--tkw-text-weight': '700', '--tkw-text-line-height': '2' });
  expect(textState({ size: { base: 'sm', lg: 'lg' } }).style)
    .toMatchObject({ '--tkw-text-size-base': '0.875rem', '--tkw-text-size-sm': '0.875rem', '--tkw-text-size-lg': '1.125rem' });
  expect(textState({ size: { base: 'sm', sm: 'md' } }).style['--tkw-text-size-lg']).toBe('1rem');
});

// 型を迂回した不正値と排他的な省略設定は、各方式が使う同一の処理で拒否する。
test('TTextは不正な設定と省略機能の併用を日本語エラーで拒否する', () => {
  for (const [name, value] of invalidTextOptions)
    expect(() => textState({ [name]: value } as TextOptions)).toThrow(name);
  expect(() => textState({ truncate: true, lineClamp: 2 })).toThrow('同時に指定できません');
});

// CSSの唯一の定義元から読み取り、本文・補足・状態の文字色を白とページ背景に対して検証する。
test('TTextの全固定toneは白とneutral-50背景で4.5対1以上になる', async () => {
  const neutrals = parseNeutralTokens(await Bun.file(new URL('../../tokens/neutrals.css', import.meta.url)).text());
  const semantics = parseSemanticTokens(await Bun.file(new URL('../../tokens/semantic.css', import.meta.url)).text());
  for (const tone of textTones.filter(value => value !== 'inherit')) {
    const foreground = tone === 'default' ? neutrals['--tkw-color-neutral-900']!
      : tone === 'muted' ? neutrals['--tkw-color-neutral-600']! : semantics[`--tkw-color-semantic-${tone}-on-subtle`]!;
    for (const background of ['0', '50']) expect(contrast(foreground, neutrals[`--tkw-color-neutral-${background}`]!)).toBeGreaterThanOrEqual(4.5);
  }
});
