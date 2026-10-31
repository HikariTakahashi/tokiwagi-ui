import type { Meta, StoryObj } from '@storybook/html-vite';
import { headerSectionPositions, type HeaderSectionPosition } from '../lib/header';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = { framework: Framework; position: HeaderSectionPosition };
const meta = {
  title: 'コンポーネント/THeaderSection', id: 'components-theadersection', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'position']),
  args: { framework: 'react', position: 'left' },
  argTypes: { framework: frameworkControl, position: { control: 'select', options: headerSectionPositions } },
  render: (args: Args) => renderComponentStory({ ...args, component: 'THeaderSection', tone: 'neutral', disabled: false }),
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
