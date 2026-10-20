// bun run generate:icons で生成。手編集しない。
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderIconExample } from '../components/icon-example';

const meta = {
  title: 'アイコン/使用例/カレンダー/calendar-chevron-bottom',
  id: 'icons-calendar-chevron-bottom-examples',
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'calendar-chevron-bottom',
  render: () => renderIconExample('calendar-chevron-bottom'),
};
