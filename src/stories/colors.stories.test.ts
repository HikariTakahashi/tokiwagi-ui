import { expect, test } from 'bun:test';
import { filterArgTypes } from 'storybook/preview-api';
import { colors, neutrals, neutralTokenName, secondaryColors, secondaryTokenName, semanticColors, semanticTokenName, tokenName, variants } from '../lib/palette';
import { Neutrals, Primary, Secondary, Semantic } from './colors.stories';

const palettes = [
  { label: 'プライマリー', story: Primary, palette: colors, nameFor: tokenName, defaultColor: 'green' },
  { label: 'セカンダリー', story: Secondary, palette: secondaryColors, nameFor: secondaryTokenName, defaultColor: 'lime' },
  { label: 'セマンティック', story: Semantic, palette: semanticColors, nameFor: semanticTokenName, defaultColor: 'success' },
];

for (const { label, story, palette, nameFor, defaultColor } of palettes) {
  // 標準Controlsの全色・4状態を描画し、対応するトークンを参照した色見本が一つ表示されることを確認する。
  test(`${label}は中央の色見本一つと色・状態の標準Controlsを使う`, () => {
    expect(story.parameters.layout).toBe('centered');
    expect(story.parameters.controls).toEqual({
      disable: false, include: ['色', '状態'], disableSaveFromUI: true,
    });
    expect(story.args).toEqual({ color: defaultColor, state: 'normal' });
    expect(story.argTypes.color.options).toEqual(palette.map(([key]) => key));
    expect(story.argTypes.color.control.labels).toEqual(Object.fromEntries(palette.map(([key, name]) => [key, name])));
    expect(story.argTypes.state.options).toEqual(['normal', 'hover', 'active', 'subtle']);
    expect(Object.keys(filterArgTypes(story.argTypes, story.parameters.controls.include))).toEqual(['color', 'state']);
    for (const [color, name] of palette) for (const [suffix, stateLabel] of variants) {
      const html = story.render({ color, state: suffix.slice(1) || 'normal' });
      expect(html).toMatch(/^<div\b[^>]*>Aa あいう<\/div>$/);
      expect(html).toContain(`aria-label="${name}・${stateLabel}"`);
      expect(html).toContain(`background-color:var(${nameFor(color, suffix)})`);
      expect(html).toContain(`color:var(${nameFor(color, suffix === '-subtle' ? '-on-subtle' : '-on')})`);
    }
  });

  // URLの選択値が候補に含まれない場合に、初期の色と状態へ戻ることを確認する。
  test(`${label}の未定義の色・状態は初期表示に戻る`, () => {
    expect(story.render({ color: 'unknown', state: 'unknown' })).toBe(story.render(story.args));
    expect(story.render({ color: 'unknown', state: 'hover' })).toBe(story.render({ ...story.args, state: 'hover' }));
    expect(story.render({ color: palette[1]![0], state: 'unknown' })).toBe(story.render({ color: palette[1]![0], state: 'normal' }));
  });
}

// ニュートラルの9段階を色だけのControlsで選択し、600を境に前景が切り替わり、白背景だけに枠が付くことを確認する。
test('ニュートラルは状態を持たず全9段階を単一の色見本で表示する', () => {
  expect(Neutrals.argTypes.color.options).toEqual(neutrals.map(([step]) => step));
  expect(Neutrals.argTypes.color.options).toHaveLength(9);
  expect(Object.keys(Neutrals.args)).toEqual(['color']);
  expect(Object.keys(filterArgTypes(Neutrals.argTypes, Neutrals.parameters.controls.include))).toEqual(['color']);
  for (const [step, usage] of neutrals) {
    const html = Neutrals.render({ color: step });
    expect(html).toMatch(/^<div\b[^>]*>Aa あいう<\/div>$/);
    expect(html).toContain(`aria-label="${step}（${usage}）"`);
    expect(html).toContain(`background-color:var(${neutralTokenName(step)})`);
    expect(html).toContain(`color:var(${neutralTokenName(Number(step) >= 600 ? '0' : '900')})`);
    expect(html.includes('tkw-color-swatch-outlined')).toBe(step === '0');
  }
});

// URLから復元した色が候補外なら、ニュートラル固有の初期段階へ戻ることを確認する。
test('ニュートラルの未定義の色は初期表示に戻る', () => {
  expect(Neutrals.render({ color: 'unknown' })).toBe(Neutrals.render(Neutrals.args));
});
