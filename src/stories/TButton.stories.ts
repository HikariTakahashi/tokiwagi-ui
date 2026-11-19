import type { Meta, StoryObj } from '@storybook/html-vite';
import { iconNames } from '../lib/icon-sources';
import { buttonTones } from '../lib/button';
import { buttonSizes } from '../lib/button-size';
import type { ButtonPreviewOptions } from './button-preview';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';
import { useStoryTextArgs } from './story-text-args';

type Args = Omit<ButtonPreviewOptions, 'component' | 'leadingIcon' | 'trailingIcon'> & {
  framework: Framework;
  leadingIcon: NonNullable<ButtonPreviewOptions['leadingIcon']> | 'none';
  trailingIcon: NonNullable<ButtonPreviewOptions['trailingIcon']> | 'none';
  textcode?: string;
};

const defaultText = '操作';
const meta = {
  title: 'コンポーネント/TButton', id: 'components-tbutton', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'text', 'tone', 'size', 'leadingIcon', 'trailingIcon', 'disabled']),
  args: { framework: 'react', text: defaultText, textcode: '', tone: 'neutral', size: 'lg', leadingIcon: 'none', trailingIcon: 'none', disabled: false },
  argTypes: {
    framework: frameworkControl,
    text: { control: 'text' },
    tone: { control: 'select', options: buttonTones },
    size: { control: 'select', options: buttonSizes },
    leadingIcon: {
      control: { type: 'select', labels: { none: 'なし' } },
      options: ['none', ...iconNames],
    },
    trailingIcon: {
      control: { type: 'select', labels: { none: 'なし' } },
      options: ['none', ...iconNames],
    },
    disabled: { control: 'boolean' },
  },
  render: ({ text, textcode, leadingIcon, trailingIcon, ...options }: Args) => {
    useStoryTextArgs(text, textcode, defaultText);
    return renderComponentStory({
      ...options, component: 'TButton',
      text: text.trim() ? text : defaultText,
      leadingIcon: leadingIcon === 'none' ? undefined : leadingIcon,
      trailingIcon: trailingIcon === 'none' ? undefined : trailingIcon,
    });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
