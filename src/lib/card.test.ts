import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { cardState, cardTitleTag, cardActionAreaState, type CardOptions, type CardTitleTag } from './card';
import { invalidCardOptions } from './card-test-helpers';

// 型を迂回した値も同じ境界で拒否し、HTML要素とリンクの意味を維持する。
test('TCardの共通検証は不正値と空のhrefを日本語エラーで拒否する', () => {
  for (const [name, value] of invalidCardOptions)
    expect(() => cardState({ [name]: value } as CardOptions)).toThrow(name);
  for (const as of ['div', '', null, 1]) expect(() => cardTitleTag(as as CardTitleTag)).toThrow('TCardTitleのas');
  for (const href of ['', '  ', null, undefined, 1]) expect(() => cardActionAreaState({ href: href as string })).toThrow('href');
  expect(cardActionAreaState({ href: '/guide', target: '_BLANK', rel: 'external Opener NoOpener' }).rel).toBe('external noopener');
  expect(cardActionAreaState({ href: '/guide', target: '_self', rel: 'opener' }).rel).toBe('opener');
});

// ユーザーが指定した影を既存のTButtonと照合し、全variantで共通の設定が使われることを確認する。
test('TCardの影はTButtonと同一のCSSを共通ルートに持つ', () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
  const card = read('../styles/card.css'); const button = read('../styles/button.css');
  expect(card.match(/box-shadow:\s*([^;]+);/)?.[1]).toBe(button.match(/box-shadow:\s*([^;]+);/)?.[1]);
  expect(card.match(/box-shadow:/g)).toHaveLength(1);
});
