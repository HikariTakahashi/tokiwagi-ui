import { expect, test } from 'bun:test';
import { colors, tokenName, variants } from '../lib/palette';
import { Primary } from './colors.stories';

// 標準Controlsの7色・4状態を描画し、既存トークンを参照する色見本が一つだけ表示されることを確認する。
test('プライマリーは中央の色見本一つと色・状態の標準Controlsを使う', () => {
  expect(Primary.parameters.layout).toBe('centered');
  expect(Primary.parameters.controls).toEqual({
    disable: false, include: ['色', '状態'], disableSaveFromUI: true,
  });
  expect(Primary.args).toEqual({ color: 'green', state: 'normal' });
  expect(Primary.argTypes.color.options).toEqual(colors.map(([key]) => key));
  expect(Primary.argTypes.state.options).toEqual(['normal', 'hover', 'active', 'subtle']);
  for (const [color, name] of colors) for (const [suffix, label] of variants) {
    const html = Primary.render({ color, state: suffix.slice(1) || 'normal' });
    expect(html).toMatch(/^<div\b[^>]*>Aa あいう<\/div>$/);
    expect(html).toContain(`aria-label="${name}・${label}"`);
    expect(html).toContain(`background-color:var(${tokenName(color, suffix)})`);
    expect(html).toContain(`color:var(${tokenName(color, suffix === '-subtle' ? '-on-subtle' : '-on')})`);
  }
});

// URLの選択値が候補に含まれない場合に、初期の色と状態を描画して参照先を固定する。
test('未定義の色・状態はグリーンの通常背景に戻る', () => {
  expect(Primary.render({ color: 'unknown', state: 'unknown' })).toBe(Primary.render(Primary.args));
});
