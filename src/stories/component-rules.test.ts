import { expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { componentReadmeForStorybook } from './component-readme';

const names = ['TBrand', 'TIcon', 'TLogo'];
const sourceRoot = new URL('../../components/', import.meta.url);
const pagesRoot = new URL('./component-rules/', import.meta.url);
const sections = ['概要', '使用場面', '状態の表し方', '使用しない場面', '表示とアクセシビリティ', '関連コンポーネントと使い分け'];
const read = (url: URL) => readFileSync(url, 'utf8');
const links = (markdown: string) => [...markdown.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]!);

// 3原本と表示ページが一対一に対応し、本文を原本から読むことで二重管理とプレビューへの混入を防ぐ。
test('コンポーネント個別ルールはMarkdown原本と薄いMDXを一対一で持つ', () => {
  expect(readdirSync(sourceRoot).sort()).toEqual(names);
  expect(readdirSync(pagesRoot).sort()).toEqual(names.map(name => `${name}.mdx`));
  for (const name of names) {
    const markdown = read(new URL(`${name}/README.md`, sourceRoot));
    const mdx = read(new URL(`${name}.mdx`, pagesRoot));
    expect([...markdown.matchAll(/^## (.+)$/gm)].map(match => match[1])).toEqual(sections);
    expect(mdx).toContain(`import readme from '../../../components/${name}/README.md?raw'`);
    expect(mdx).toContain(`title="コンポーネント/個別ルール/${name}" id="components-${name.toLowerCase()}-rules"`);
    expect(mdx).toContain('{componentReadmeForStorybook(readme)}</Markdown>');
    expect(mdx).not.toMatch(/^#/m);
    expect(mdx).not.toMatch(/<Canvas|<Story|<ComponentPreview/);
    expect(markdown).not.toContain('```');
  }
});

// 原本内の使用例・関連リンクが実在するファイルを指し、Storybookでは各資料の実際のMetaに対応するURLになる。
test('利用ルールのリンクは原本とStorybookの両方で解決できる', () => {
  for (const name of names) {
    const source = new URL(`${name}/README.md`, sourceRoot);
    const markdown = read(source);
    const renderedLinks = links(componentReadmeForStorybook(markdown));
    const sourceLinks = links(markdown);
    expect(markdown).toContain(`[使用例を見る](../../src/stories/${name}.stories.ts)`);
    expect(sourceLinks.length).toBeGreaterThan(3);
    expect(renderedLinks).toHaveLength(sourceLinks.length);
    sourceLinks.forEach((destination, index) => {
      const target = new URL(destination, source);
      expect(existsSync(target)).toBe(true);
      const targetSource = read(target);
      // 関連READMEは対応する表示用MDXのMetaから公開先を求める。
      const metadata = destination.endsWith('/README.md')
        ? destination.includes('/icons/logo/')
          ? read(new URL('../icons/logo.mdx', import.meta.url))
          : read(new URL(`${destination.split('/').at(-2)}.mdx`, pagesRoot))
        : targetSource;
      const id = metadata.match(/\bid[:=]\s*['"]([^'"]+)['"]/)?.[1]
        ?? metadata.match(/<Meta title="([^"]+)"/)?.[1]?.replaceAll('/', '-');
      expect(id).toBeDefined();
      expect(renderedLinks[index]).toBe(`./?path=/${destination.endsWith('.stories.ts') ? 'story' : 'docs'}/${id}--${destination.endsWith('.stories.ts') ? 'default' : 'docs'}`);
    });
  }
});

// 表示用変換は既知の資料リンクだけを扱い、文章・寸法・未登録のURLを書き換えない。
test('Storybook向けのリンク変換は利用ルールの本文を維持する', () => {
  const markdown = '図形幅32px。\n\n[TLogo](../TLogo/README.md)\n[外部資料](https://example.com/rules)\n[未登録](./other.md)';
  expect(componentReadmeForStorybook(markdown)).toBe('図形幅32px。\n\n[TLogo](./?path=/docs/components-tlogo-rules--docs)\n[外部資料](https://example.com/rules)\n[未登録](./other.md)');
});
