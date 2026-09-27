import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { compile } from 'tailwindcss';

// 全93トークンから背景・文字・境界線と操作状態のユーティリティが生成され、元の変数を参照することを確認する。
test('共通テーマの全色をTailwindユーティリティとして利用できる', async () => {
  const theme = readFileSync(new URL('../../tokens/tailwind.css', import.meta.url), 'utf8');
  const source = ['colors', 'secondary', 'semantic', 'neutrals'].map(name =>
    readFileSync(new URL(`../../tokens/${name}.css`, import.meta.url), 'utf8')).join('\n');
  const tokens = [...source.matchAll(/(--tkw-color-[\w-]+):/g)].map(match => match[1]!);
  expect(tokens).toHaveLength(93);
  const compiler = await compile(theme.replace(/@import[^;]+;/g, '') + '\n@tailwind utilities;');
  const classes = tokens.flatMap(token => {
    const name = token.replace('--tkw-color-', 'tkw-');
    return [`bg-${name}`, `text-${name}`, `border-${name}`, `hover:bg-${name}`, `active:bg-${name}`];
  });
  const css = compiler.build(classes);
  for (const token of tokens) {
    const name = token.replace('--tkw-color-', 'tkw-');
    expect(css).toContain(`.bg-${name}`);
    expect(css).toContain(`.text-${name}`);
    expect(css).toContain(`.border-${name}`);
    expect(css).toContain(`hover\\:bg-${name}`);
    expect(css).toContain(`active\\:bg-${name}`);
    expect(css).toContain(`var(${token})`);
  }
});
