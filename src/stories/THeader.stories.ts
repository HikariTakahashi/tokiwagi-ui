import type { Meta, StoryObj } from '@storybook/html-vite';
import { headerBackgroundColors } from '../lib/header-background';
import { headerTones } from '../lib/header';
import type { HeaderPreviewOptions } from './header-preview';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = Omit<HeaderPreviewOptions, 'component'> & { framework: Framework };
const meta = {
  title: 'コンポーネント/ヘッダー/THeader', id: 'components-theader', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'backgroundColor', 'tone', 'disabled', 'view']),
  args: { framework: 'react', backgroundColor: '--tkw-color-neutral-0', tone: 'neutral', disabled: false, view: 'month' },
  argTypes: { framework: frameworkControl,
    backgroundColor: { control: 'select', options: headerBackgroundColors },
    tone: { control: 'select', options: headerTones },
    disabled: { control: 'boolean' },
    view: { control: 'select', options: ['year', 'month', 'week'] }, },
  render: (args: Args) => renderComponentStory({ ...args, component: 'THeader' }),
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
