// bun run generate:icons で生成。手編集しない。
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderIconExample } from '../components/icon-example';

const meta = {
  title: 'アイコン/使用例/三角枠/triangle-chevron-top',
  id: 'icons-triangle-chevron-top-examples',
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'triangle-chevron-top',
  render: () => renderIconExample('triangle-chevron-top'),
};
