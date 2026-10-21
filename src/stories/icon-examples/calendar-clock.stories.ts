// bun run generate:icons で生成。手編集しない。
import type { Meta, StoryObj } from '@storybook/html-vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TIcon, type TIconProps } from 'tokiwagi-ui/react';
import { iconSizes } from '../../lib/icon-assets';
import { colors, tokenName } from '../../lib/palette';

type Args = Required<Pick<TIconProps, 'size' | 'color'>>;

const colorOptions = [
  ['currentColor', '継承', 'currentColor'],
  ['neutral', 'ニュートラル', 'var(--tkw-color-neutral-900)'],
  ...colors.map(([key, label]) => [key, label, 'var(' + tokenName(key) + ')']),
];

const meta = {
  title: 'アイコン/使用例/カレンダー/calendar-clock',
  id: 'icons-calendar-clock-examples',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
    controls: { disable: false, include: ['size', 'color'], disableSaveFromUI: true },
    options: { layout: { showPanel: true } },
  },
  args: { size: 24, color: 'currentColor' },
  argTypes: {
    size: { control: 'select', options: iconSizes },
    color: {
      options: colorOptions.map(([value]) => value),
      mapping: Object.fromEntries(colorOptions.map(([value, , color]) => [value, color])),
      control: { type: 'select', labels: Object.fromEntries(colorOptions.map(([value, label]) => [value, label])) },
    },
  },
  // HTML版Storybookでも公開TIconを描画し、Controlsの変更ごとに更新する。
  render: (args: Args) => renderToStaticMarkup(createElement(TIcon, { ...args, name: 'calendar-clock' })),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  name: 'calendar-clock',
};
