import type { Meta, StoryObj } from '@storybook/html-vite';
import type { TBrandProps } from 'tokiwagi-ui/react';
import { logoSizes } from '../lib/logo';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = { framework: Framework } & Required<Pick<TBrandProps, 'size'>>;
const meta = {
  title: 'コンポーネント/TBrand',
  id: 'components-tbrand',
  tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'size']),
  args: { framework: 'react', size: 32 },
  argTypes: {
    framework: frameworkControl,
    size: { control: 'select', options: logoSizes },
  },
  render: (args: Args) => renderComponentStory({ component: 'TBrand', ...args }),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
