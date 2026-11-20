import type { Meta, StoryObj } from '@storybook/html-vite';
import { useArgs } from 'storybook/preview-api';
import { checkboxTones } from '../lib/checkbox';
import type { CheckboxPreviewOptions } from './components/CheckboxPreview';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';
import { useStoryTextArgs } from './story-text-args';

type Args = Omit<CheckboxPreviewOptions, 'component' | 'onCheckedChange'> & {
  framework: Framework;
  labelcode?: string;
  descriptioncode?: string;
  errorcode?: string;
};
const fields = ['framework', 'checked', 'indeterminate', 'label', 'description', 'error', 'tone', 'disabled', 'required'];
const meta = {
  title: 'コンポーネント/TCheckbox',
  id: 'components-tcheckbox',
  tags: ['!autodocs'],
  parameters: componentStoryParameters(fields),
  args: {
    framework: 'react', checked: false, indeterminate: false, label: 'カレンダーを表示',
    description: '', error: '', tone: 'blue', disabled: false, required: false,
  },
  argTypes: {
    framework: frameworkControl,
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    tone: { control: 'select', options: checkboxTones },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  render: (args: Args) => {
    const [, updateArgs] = useArgs();
    useStoryTextArgs(args.label, args.labelcode, 'カレンダーを表示', 'label');
    useStoryTextArgs(args.description, args.descriptioncode, '', 'description');
    useStoryTextArgs(args.error, args.errorcode, '', 'error');
    return renderComponentStory({
      component: 'TCheckbox', framework: args.framework, checked: args.checked, indeterminate: args.indeterminate,
      label: args.label, description: args.description, error: args.error, tone: args.tone, disabled: args.disabled, required: args.required,
      onCheckedChange: checked => updateArgs({ checked, indeterminate: false }),
    });
  },
} satisfies Meta<Args>;

export default meta;
export const Default: StoryObj<Args> = {};
