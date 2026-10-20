import { iconCategories, type IconAsset } from '../src/lib/icon-assets';

export const generatedStoryMarker = '// bun run generate:icons で生成。手編集しない。';

export function iconStorySource(icon: IconAsset): string {
  const category = iconCategories.find(([key]) => key === icon.category)![1];
  return `${generatedStoryMarker}
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderIconExample } from '../components/icon-example';

const meta = {
  title: 'アイコン/使用例/${category}/${icon.name}',
  id: 'icons-${icon.name}-examples',
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '${icon.name}',
  render: () => renderIconExample('${icon.name}'),
};
`;
}
