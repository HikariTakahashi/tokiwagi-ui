import { expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { componentReadmeForStorybook } from './component-readme';

const names = ['TBrand', 'TButton', 'TCard', 'TCheckbox', 'THeader', 'THeaderButton', 'THeaderButtonGroup', 'THeaderLink', 'THeaderSection', 'TIcon', 'TLink', 'TLinkButton', 'TLogo', 'TSelect', 'TSidebar', 'TSidebarBody', 'TSidebarFooter', 'TSidebarHeader', 'TSidebarLayout', 'TSidebarMain', 'TText'];
const sourceRoot = new URL('../../components/', import.meta.url);
const pagesRoot = new URL('./component-rules/', import.meta.url);
const sections = ['概要', '使用場面', '状態の表し方', '使用しない場面', '表示とアクセシビリティ', '関連コンポーネントと使い分け'];
const read = (url: URL) => readFileSync(url, 'utf8');
const links = (markdown: string) => [...markdown.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]!);
const groupFor = (name: string) => name.startsWith('THeader')
  ? { title: 'ヘッダー', docs: 'THeader' }
  : name.startsWith('TSidebar') ? { title: 'サイドバー', docs: 'TSidebarLayout' } : undefined;

// Docsとストーリーが同じ階層になり、グループ内の各利用ルールと旧URLから原本を読めることを確認する。
test('コンポーネントのDocsとストーリーを同じ階層に配置する', () => {
  expect(readdirSync(sourceRoot).sort()).toEqual(names);
  expect(readdirSync(pagesRoot).sort()).toEqual(names.map(name => `${name}.mdx`));
  for (const name of names) {
    const group = groupFor(name);
    const storyTitle = `コンポーネント/${group?.title ?? name}`;
    const story = read(new URL(`./${name}.stories.ts`, import.meta.url));
    const markdown = read(new URL(`${name}/README.md`, sourceRoot));
    const mdx = read(new URL(`${name}.mdx`, pagesRoot));
    const legacy = group !== undefined && group.docs !== name;
    const docsTitle = legacy ? `コンポーネント/個別ルール/${name}` : storyTitle;
    expect(story).toContain(`title: '${storyTitle}'`);
    expect(story).toMatch(new RegExp(`export const Default[^=]*= \\{ name: '${name}'`));
    expect([...markdown.matchAll(/^## (.+)$/gm)].map(match => match[1])).toEqual(sections);
    expect(mdx).toContain(`title="${docsTitle}" id="components-${name.toLowerCase()}-rules"`);
    expect(mdx.includes("tags={['!dev']}")).toBe(legacy);
    if (group) {
      const groupedMdx = read(new URL(`${group.docs}.mdx`, pagesRoot));
      expect(groupedMdx).toContain(`import ${name} from '../../../components/${name}/README.md?raw'`);
      expect(groupedMdx.match(/readmes=\{\{([^}]+)\}\}/)?.[1]?.split(',').map(entry => entry.trim())).toContain(name);
    }
    if (!group || legacy) {
      expect(mdx).toContain(`import readme from '../../../components/${name}/README.md?raw'`);
      expect(mdx).toContain('{componentReadmeForStorybook(readme)}</Markdown>');
    }
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
      const component = destination.split('/').at(-2) ?? '';
      const group = destination.startsWith('../T') && destination.endsWith('/README.md') ? groupFor(component) : undefined;
      // 関連READMEは対応する表示用MDXのMetaから公開先を求める。
      const metadata = destination.endsWith('/README.md')
        ? destination.includes('/icons/logo/')
          ? read(new URL('../icons/logo.mdx', import.meta.url))
          : read(new URL(`${group?.docs ?? component}.mdx`, pagesRoot))
        : targetSource;
      const id = metadata.match(/\bid[:=]\s*['"]([^'"]+)['"]/)?.[1]
        ?? metadata.match(/<Meta title="([^"]+)"/)?.[1]?.replaceAll('/', '-');
      expect(id).toBeDefined();
      const story = destination.endsWith('.stories.ts');
      const anchor = group ? `#${component.toLowerCase()}` : '';
      expect(renderedLinks[index]).toBe(`./?path=/${story ? 'story' : 'docs'}/${id}--${story ? 'default' : 'docs'}${anchor}`);
    });
  }
});

// 表示用変換は既知の資料リンクだけを扱い、文章・寸法・未登録のURLを書き換えない。
test('Storybook向けのリンク変換は利用ルールの本文を維持する', () => {
  const markdown = '図形幅32px。\n\n[TLogo](../TLogo/README.md)\n[外部資料](https://example.com/rules)\n[未登録](./other.md)';
  expect(componentReadmeForStorybook(markdown)).toBe('図形幅32px。\n\n[TLogo](./?path=/docs/components-tlogo-rules--docs)\n[外部資料](https://example.com/rules)\n[未登録](./other.md)');
});

// 同じグループ内の関連部品に、そのページ内の見出しへ移動するリンクを設定する。
test('同じDocs内の関連部品へのリンクをページ内リンクにする', () => {
  const markdown = '[THeaderLink](../THeaderLink/README.md) / [TLink](../TLink/README.md)';
  expect(componentReadmeForStorybook(markdown, 'components-theader-rules'))
    .toBe('[THeaderLink](#theaderlink) / [TLink](./?path=/docs/components-tlink-rules--docs)');
});
