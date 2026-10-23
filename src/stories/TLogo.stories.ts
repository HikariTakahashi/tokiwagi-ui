import type { Meta, StoryObj } from '@storybook/html-vite';
import type { TLogoProps } from 'tokiwagi-ui/react';
import { logoSizes } from '../lib/logo';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = { framework: Framework } & Required<Pick<TLogoProps, 'size' | 'decorative'>>;
const meta = {
  title: 'コンポーネント/TLogo',
  id: 'components-tlogo',
  tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'size', 'decorative']),
  args: { framework: 'react', size: 32, decorative: false },
  argTypes: {
    framework: frameworkControl,
    size: { control: 'select', options: logoSizes },
    decorative: { control: 'boolean' },
  },
  render: (args: Args) => renderComponentStory({ component: 'TLogo', ...args }),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
