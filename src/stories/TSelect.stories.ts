import type { Meta, StoryObj } from '@storybook/html-vite';
import { useArgs } from 'storybook/preview-api';
import { selectSizes, selectTones } from '../lib/select';
import type { SelectPreviewOptions } from './select-preview';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';
import { useStoryTextArgs } from './story-text-args';

type Args = Omit<SelectPreviewOptions, 'component' | 'onValueChange'> & { framework: Framework;
  labelcode?: string; descriptioncode?: string; errorcode?: string; placeholdercode?: string };
const fields = ['framework', 'value', 'placeholder', 'label', 'description', 'error', 'tone', 'size', 'disabled', 'required', 'disableCard'];
const meta = {
  title: 'コンポーネント/TSelect', id: 'components-tselect', tags: ['!autodocs'],
  parameters: componentStoryParameters(fields),
  args: { framework: 'react', value: 'button', placeholder: '', label: '', description: '', error: '',
    tone: 'neutral', size: 'md', disabled: false, required: false, disableCard: false },
  argTypes: {
    framework: frameworkControl,
    value: { control: { type: 'select', labels: { '': '未選択', button: 'ボタン', label: 'ラベル', card: 'カード' } }, options: ['', 'button', 'label', 'card'] },
    placeholder: { control: 'text' }, label: { control: 'text' }, description: { control: 'text' }, error: { control: 'text' },
    tone: { control: 'select', options: selectTones }, size: { control: 'select', options: selectSizes },
    disabled: { control: 'boolean' }, required: { control: 'boolean' }, disableCard: { control: 'boolean' },
  },
  render: (args: Args) => {
    const [, updateArgs] = useArgs();
    useStoryTextArgs(args.label ?? '', args.labelcode, '', 'label');
    useStoryTextArgs(args.description ?? '', args.descriptioncode, '', 'description');
    useStoryTextArgs(args.error ?? '', args.errorcode, '', 'error');
    useStoryTextArgs(args.placeholder ?? '', args.placeholdercode, '', 'placeholder');
    return renderComponentStory({ component: 'TSelect', framework: args.framework, value: args.value,
      tone: args.tone, size: args.size, label: args.label, description: args.description, error: args.error,
      placeholder: args.placeholder || (args.value === '' ? '選択してください' : undefined),
      disabled: args.disabled, required: args.required, disableCard: args.disableCard,
      onValueChange: value => updateArgs({ value }),
    });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = { name: 'TSelect' };
