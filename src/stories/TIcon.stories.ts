import type { Meta, StoryObj } from '@storybook/html-vite';
import { iconNames, type TIconProps } from 'tokiwagi-ui/react';
import { iconSizes } from '../lib/icon-assets';
import { colors, tokenName } from '../lib/palette';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = { framework: Framework } & Required<Pick<TIconProps, 'name' | 'size' | 'color'>>;
const colorOptions = [
  ['currentColor', '継承', 'currentColor'],
  ['neutral', 'ニュートラル', 'var(--tkw-color-neutral-900)'],
  ...colors.map(([key, label]) => [key, label, 'var(' + tokenName(key) + ')']),
];

const meta = {
  title: 'コンポーネント/TIcon',
  id: 'components-ticon',
  tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'name', 'size', 'color']),
  args: { framework: 'react', name: 'bell', size: 24, color: 'currentColor' },
  argTypes: {
    framework: frameworkControl,
    name: { control: 'select', options: iconNames },
    size: { control: 'select', options: iconSizes },
    color: {
      options: colorOptions.map(([value]) => value),
      mapping: Object.fromEntries(colorOptions.map(([value, , color]) => [value, color])),
      control: { type: 'select', labels: Object.fromEntries(colorOptions.map(([value, label]) => [value, label])) },
    },
  },
  render: (args: Args) => renderComponentStory({ component: 'TIcon', ...args }),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
