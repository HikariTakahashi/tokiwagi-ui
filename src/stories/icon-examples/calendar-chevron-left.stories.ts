// bun run generate:icons で生成。手編集しない。
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderIconExample } from '../components/icon-example';

const meta = {
  title: 'アイコン/使用例/カレンダー/calendar-chevron-left',
  id: 'icons-calendar-chevron-left-examples',
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'calendar-chevron-left',
  render: () => renderIconExample('calendar-chevron-left'),
};
