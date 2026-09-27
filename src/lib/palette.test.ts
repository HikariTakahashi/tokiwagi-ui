import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { colors, contrast, neutrals, neutralTokenName, parseNeutralTokens, parseSecondaryTokens, parseSemanticTokens, parseTokens, secondaryColors, secondaryTokenName, semanticColors, semanticTokenName, tokenName, variants } from './palette';
const css = readFileSync(new URL('../../tokens/colors.css', import.meta.url), 'utf8');
const neutralCss = readFileSync(new URL('../../tokens/neutrals.css', import.meta.url), 'utf8');
const secondaryCss = readFileSync(new URL('../../tokens/secondary.css', import.meta.url), 'utf8');
const semanticCss = readFileSync(new URL('../../tokens/semantic.css', import.meta.url), 'utf8');
describe('カラートークン', () => {
  // プライマリー42トークンがすべて存在し、文字と背景の28組が4.5:1以上のコントラストを持つことを確認する。
  test('プライマリー42トークンと文字・背景28組がアクセシビリティ基準を満たす', () => {
    const tokens = parseTokens(css);
    expect(Object.keys(tokens)).toHaveLength(42);
    for (const [key] of colors) for (const [suffix] of variants) {
      expect(contrast(tokens[tokenName(key, suffix)]!, tokens[tokenName(key, suffix === '-subtle' ? '-on-subtle' : '-on')]!)).toBeGreaterThanOrEqual(4.5);
    }
  });
  // コントラスト計算が既知の値と一致し、前景色と背景色を入れ替えても結果が変わらないことを確認する。
  test('コントラスト比を正しく計算し、色の指定順に依存しない', () => {
    expect(contrast('#000000', '#FFFFFF')).toBe(21);
    expect(contrast('#808080', '#808080')).toBe(1);
    expect(contrast('#123456', '#abcdef')).toBeCloseTo(contrast('#abcdef', '#123456'));
  });
  // プライマリートークンの欠落や不正なHEXに対し、問題のあるトークン名を含む日本語エラーを返すことを確認する。
  test('不足または不正なプライマリートークンを名前付きで報告する', () => {
    expect(() => parseTokens(css.replace(/--tkw-color-primary-green:.*;/, ''))).toThrow('不足しているトークン: --tkw-color-primary-green');
    expect(() => parseTokens(css.replace(/(--tkw-color-primary-green:)\s*#[\da-f]{6}/i, '$1 #GGGGGG'))).toThrow('不正なHEX: --tkw-color-primary-green');
  });
  // 同一トークンの重複を拒否し、CSSコメント内の記述をトークンとして誤認しないことを確認する。
  test('重複トークンを拒否し、CSSコメント内の記述を無視する', () => {
    expect(() => parseTokens(css + '\n:root { --tkw-color-primary-green: #FFFFFF; }')).toThrow('重複したトークン');
    expect(parseTokens(css + '/* --tkw-color-primary-green: invalid; */')).toEqual(parseTokens(css));
  });
  // コントラスト不足をパースエラーにせず、見本サイトが1:1の比率を表示して修正を促せることを確認する。
  test('コントラスト不足の配色も見本で確認できる', () => {
    const foreground = parseTokens(css)[tokenName('green', '-on')]!;
    const tokens = parseTokens(css.replace(/(--tkw-color-primary-green:)\s*#[\da-f]{6}/i, `$1 ${foreground}`));
    expect(contrast(tokens[tokenName('green')]!, tokens[tokenName('green', '-on')]!)).toBe(1);
  });

  // ニュートラル9トークンがすべて存在し、値が正規化された6桁HEXであることを確認する。
  test('ニュートラル9トークンが揃い、正しいHEX形式である', () => {
    const tokens = parseNeutralTokens(neutralCss);
    expect(Object.keys(tokens)).toHaveLength(9);
    for (const [step] of neutrals) expect(tokens[neutralTokenName(step)]).toMatch(/^#[\dA-F]{6}$/);
  });

  // ニュートラルトークンの欠落や不正なHEXに対し、問題のあるトークン名を含む日本語エラーを返すことを確認する。
  test('不足または不正なニュートラルトークンを名前付きで報告する', () => {
    expect(() => parseNeutralTokens(neutralCss.replace(/--tkw-color-neutral-200:.*;/, ''))).toThrow('不足しているトークン: --tkw-color-neutral-200');
    expect(() => parseNeutralTokens(neutralCss.replace('#A1A1AA', '#XYZXYZ'))).toThrow('不正なHEX: --tkw-color-neutral-400');
  });

  // セカンダリー18トークンがすべて存在し、文字と背景の12組が4.5:1以上のコントラストを持つことを確認する。
  test('セカンダリー18トークンと文字・背景12組がアクセシビリティ基準を満たす', () => {
    const tokens = parseSecondaryTokens(secondaryCss);
    expect(Object.keys(tokens)).toHaveLength(18);
    for (const [key] of secondaryColors) for (const [suffix] of variants) {
      const foreground = suffix === '-subtle' ? '-on-subtle' : '-on';
      expect(contrast(tokens[secondaryTokenName(key, suffix)]!, tokens[secondaryTokenName(key, foreground)]!)).toBeGreaterThanOrEqual(4.5);
    }
  });

  // セカンダリートークンの欠落や不正なHEXに対し、問題のあるトークン名を含む日本語エラーを返すことを確認する。
  test('不足または不正なセカンダリートークンを名前付きで報告する', () => {
    expect(() => parseSecondaryTokens(secondaryCss.replace(/--tkw-color-secondary-lime:.*;/, ''))).toThrow('不足しているトークン: --tkw-color-secondary-lime');
    expect(() => parseSecondaryTokens(secondaryCss.replace('#F3A24F', '#ORANGE'))).toThrow('不正なHEX: --tkw-color-secondary-orange');
  });

  // セマンティック24トークンがすべて存在し、文字と背景の16組が4.5:1以上のコントラストを持つことを確認する。
  test('セマンティック24トークンと文字・背景16組がアクセシビリティ基準を満たす', () => {
    const tokens = parseSemanticTokens(semanticCss);
    expect(Object.keys(tokens)).toHaveLength(24);
    for (const [key] of semanticColors) for (const [suffix] of variants) {
      const foreground = suffix === '-subtle' ? '-on-subtle' : '-on';
      expect(contrast(tokens[semanticTokenName(key, suffix)]!, tokens[semanticTokenName(key, foreground)]!)).toBeGreaterThanOrEqual(4.5);
    }
  });

  // セマンティックトークンの欠落や不正なHEXに対し、問題のあるトークン名を含む日本語エラーを返すことを確認する。
  test('不足または不正なセマンティックトークンを名前付きで報告する', () => {
    expect(() => parseSemanticTokens(semanticCss.replace(/--tkw-color-semantic-success:.*;/, ''))).toThrow('不足しているトークン: --tkw-color-semantic-success');
    expect(() => parseSemanticTokens(semanticCss.replace('#F4767F', '#ERROR!'))).toThrow('不正なHEX: --tkw-color-semantic-error');
  });
});
