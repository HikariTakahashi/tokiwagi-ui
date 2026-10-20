// bun run generate:icons で生成。手編集しない。
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderIconExample } from '../components/icon-example';

const meta = {
  title: 'アイコン/使用例/基本アイコン/panel-close-right',
  id: 'icons-panel-close-right-examples',
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'panel-close-right',
  render: () => renderIconExample('panel-close-right'),
};
