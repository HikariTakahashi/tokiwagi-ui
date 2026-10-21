import { expect, test } from 'bun:test';
import { iconNames, iconSources } from '../../lib/icon-sources';
import { iconSizes } from '../../lib/icon-assets';
import { colors, tokenName } from '../../lib/palette';

const stories = await Promise.all(iconNames.map(async name => {
  const story: typeof import('../icon-examples/bell-off.stories') = await import(`../icon-examples/${name}.stories.ts`);
  return { name, meta: story.default, example: story.Default };
}));
const geometry = (svg: string) => svg.match(/\b(?:d|viewBox|stroke-width|stroke-linecap|stroke-linejoin|fill-rule|clip-rule)="[^"]*"/g);

// 生成された全CSFを読み込み、公開名固定・初期値・最小限のControlsと標準パネルを確認する。
test('全329ストーリーは図柄ごとの名前と共通の閲覧設定を持つ', () => {
  expect(stories).toHaveLength(329);
  for (const { name, meta, example } of stories) {
    expect(meta.id).toBe(`icons-${name}-examples`);
    expect(example.name).toBe(name);
    expect(meta.args).toEqual({ size: 24, color: 'currentColor' });
    expect(Object.keys(meta.argTypes)).toEqual(['size', 'color']);
    expect(meta.parameters.layout).toBe('centered');
    expect(meta.parameters.controls).toEqual({ disable: false, include: ['size', 'color'], disableSaveFromUI: true });
    expect(meta.parameters.options.layout.showPanel).toBe(true);
    expect(example.play).toBeUndefined();
    expect(Object.keys(meta.argTypes)).not.toContain('onClick');
  }
});

// 各ストーリーを4サイズで実描画し、別の図柄への取り違え・旧ページUI・SVG属性の欠落を検出する。
test('全ストーリーが対応する原本の図形を装飾SVG一つで表示する', () => {
  for (const { name, meta } of stories) for (const size of iconSizes) {
    const html = meta.render({ size, color: 'currentColor' });
    expect(html).toMatch(/^<svg\b[\s\S]*<\/svg>$/);
    expect(html.match(/<svg\b/g)).toHaveLength(1);
    expect(html).not.toMatch(/<(?:button|a|h1|p|select)\b/);
    expect(geometry(html)).toEqual(geometry(iconSources[name]));
    expect(html).toContain(`width="${size}" height="${size}"`);
    expect(html).toContain('aria-hidden="true" focusable="false"');
    expect(html).toContain('color:currentColor');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    for (const match of html.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(match[1]);
  }
});

// 色のURL値が安全なキーで、既存トークンへ変換後も線と塗りの図形を維持することを確認する。
test('全ストーリーの色選択は継承・ニュートラル・7色のトークンに対応する', () => {
  const expected: Record<string, string> = Object.fromEntries([
    ['currentColor', 'currentColor'], ['neutral', 'var(--tkw-color-neutral-900)'],
    ...colors.map(([key]) => [key, `var(${tokenName(key)})`]),
  ]);
  for (const { name, meta } of stories) {
    expect(meta.argTypes.color.options).toEqual(Object.keys(expected));
    expect(meta.argTypes.color.mapping).toEqual(expected);
    for (const key of meta.argTypes.color.options) expect(key).toMatch(/^[a-zA-Z0-9-]+$/);
    for (const color of Object.values(expected)) {
      const html = meta.render({ size: 24, color });
      expect(html).toContain(`color:${color}`);
      expect(geometry(html)).toEqual(geometry(iconSources[name]));
      expect(html).not.toMatch(/(?:stroke|fill)="black"/);
    }
  }
});
