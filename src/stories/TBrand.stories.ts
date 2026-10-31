import type { Meta, StoryObj } from '@storybook/html-vite';
import type { TBrandProps } from 'tokiwagi-ui/react';
import { logoSizes } from '../lib/logo';
import { brandName } from '../lib/brand';
import { useBrandTextArgs } from './brand-text-args';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = { framework: Framework; textcode?: string } & Required<Pick<TBrandProps, 'text' | 'size'>>;
const meta = {
  title: 'コンポーネント/TBrand',
  id: 'components-tbrand',
  tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'text', 'size']),
  args: { framework: 'react', text: brandName, size: 32, textcode: '' },
  argTypes: {
    framework: frameworkControl,
    text: { control: 'text' },
    size: { control: 'select', options: logoSizes },
    textcode: { type: 'string', control: false, table: { disable: true } },
  },
  render: (args: Args) => {
    useBrandTextArgs(args.text, args.textcode);
    return renderComponentStory({ component: 'TBrand', framework: args.framework, text: args.text, size: args.size });
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
