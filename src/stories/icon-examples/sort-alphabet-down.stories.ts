// bun run generate:icons で生成。手編集しない。
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderIconExample } from '../components/icon-example';

const meta = {
  title: 'アイコン/使用例/基本アイコン/sort-alphabet-down',
  id: 'icons-sort-alphabet-down-examples',
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'sort-alphabet-down',
  render: () => renderIconExample('sort-alphabet-down'),
};
