import type { Meta, StoryObj } from '@storybook/html-vite';
import { iconNames } from '../lib/icon-sources';
import { buttonTones } from '../lib/button';
import type { ButtonPreviewOptions } from './button-preview';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';
import { useStoryTextArgs } from './story-text-args';

type Args = Omit<ButtonPreviewOptions, 'component' | 'leadingIcon'> & {
  framework: Framework;
  leadingIcon: NonNullable<ButtonPreviewOptions['leadingIcon']> | 'none';
  textcode?: string;
};

const defaultText = '操作';
const meta = {
  title: 'コンポーネント/TButton', id: 'components-tbutton', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'text', 'tone', 'leadingIcon', 'disabled']),
  args: { framework: 'react', text: defaultText, textcode: '', tone: 'neutral', leadingIcon: 'none', disabled: false },
  argTypes: {
    framework: frameworkControl,
    text: { control: 'text' },
    tone: { control: 'select', options: buttonTones },
    leadingIcon: {
      control: { type: 'select', labels: { none: 'なし' } },
      options: ['none', ...iconNames],
    },
    disabled: { control: 'boolean' },
  },
  render: ({ text, textcode, leadingIcon, ...options }: Args) => {
    useStoryTextArgs(text, textcode, defaultText);
    return renderComponentStory({
      ...options, component: 'TButton',
      text: text.trim() ? text : defaultText,
      leadingIcon: leadingIcon === 'none' ? undefined : leadingIcon,
    });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
