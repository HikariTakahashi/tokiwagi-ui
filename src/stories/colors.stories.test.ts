import { expect, test } from 'bun:test';
import { colors, secondaryColors, secondaryTokenName, tokenName, variants } from '../lib/palette';
import { Primary, Secondary } from './colors.stories';

const palettes = [
  { label: 'プライマリー', story: Primary, palette: colors, nameFor: tokenName, defaultColor: 'green' },
  { label: 'セカンダリー', story: Secondary, palette: secondaryColors, nameFor: secondaryTokenName, defaultColor: 'lime' },
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
  });
}
