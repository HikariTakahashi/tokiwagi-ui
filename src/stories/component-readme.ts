/** Markdown原本のリポジトリ内リンクを、Storybookの閲覧先へ変換する。 */
export function componentReadmeForStorybook(readme: string): string {
  const destinations: Record<string, string> = {
    '../../src/stories/THeaderSection.stories.ts': '/story/components-theadersection--default',
    '../THeaderSection/README.md': '/docs/components-theadersection-rules--docs',
    '../../src/stories/THeader.stories.ts': '/story/components-theader--default',
    '../THeader/README.md': '/docs/components-theader-rules--docs',
    '../../src/stories/THeaderButton.stories.ts': '/story/components-theaderbutton--default',
    '../THeaderButton/README.md': '/docs/components-theaderbutton-rules--docs',
    '../../src/stories/THeaderButtonGroup.stories.ts': '/story/components-theaderbuttongroup--default',
    '../THeaderButtonGroup/README.md': '/docs/components-theaderbuttongroup-rules--docs',
    '../../src/stories/TBrand.stories.ts': '/story/components-tbrand--default',
    '../../src/stories/TIcon.stories.ts': '/story/components-ticon--default',
    '../../src/stories/TLogo.stories.ts': '/story/components-tlogo--default',
    '../TBrand/README.md': '/docs/components-tbrand-rules--docs',
    '../TIcon/README.md': '/docs/components-ticon-rules--docs',
    '../TLogo/README.md': '/docs/components-tlogo-rules--docs',
    '../../icons/logo/README.md': '/docs/brand-logo--docs',
    '../../src/stories/icons.mdx': '/docs/アイコン-アイコン名および用途--docs',
    '../../src/stories/icon-display.mdx': '/docs/icons-display--docs',
    '../../src/stories/icon-naming.mdx': '/docs/アイコン-命名基準--docs',
    '../../src/stories/colors.mdx': '/docs/カラー-使用ルール--docs',
  };
  return readme.replace(/\]\(([^)]+)\)/g, (link, destination: string) =>
    destinations[destination] ? `](./?path=${destinations[destination]})` : link);
}
