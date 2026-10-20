// bun run generate:icons で生成。手編集しない。
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderIconExample } from '../components/icon-example';

const meta = {
  title: 'アイコン/使用例/四角枠/square-chevron-bottom',
  id: 'icons-square-chevron-bottom-examples',
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'square-chevron-bottom',
  render: () => renderIconExample('square-chevron-bottom'),
};
