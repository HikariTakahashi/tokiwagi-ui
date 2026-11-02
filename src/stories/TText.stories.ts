import type { Meta, StoryObj } from '@storybook/html-vite';
import { textSizes, textWeights, textTones, type TextOptions } from '../lib/text';
import { useStoryTextArgs } from './story-text-args';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = Omit<TextOptions, 'size' | 'weight'> & {
  framework: Framework; text: string; textcode?: string;
  size: 'unset' | typeof textSizes[number]; weight: 'unset' | typeof textWeights[number];
  responsive: boolean; sizeSm: 'unset' | typeof textSizes[number]; sizeLg: 'unset' | typeof textSizes[number];
};
const defaultText = '今日の予定を確認できます。';
const meta = {
  title: 'コンポーネント/TText', id: 'components-ttext', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'text', 'as', 'size', 'responsive', 'sizeSm', 'sizeLg',
    'weight', 'lineHeight', 'tone', 'align', 'truncate', 'lineClamp', 'whiteSpace', 'inherit', 'italic', 'decoration']),
  args: { framework: 'react', text: defaultText, textcode: '', as: 'span', size: 'unset', weight: 'unset',
    responsive: false, sizeSm: 'unset', sizeLg: 'unset', tone: 'default', align: 'start', truncate: false,
    whiteSpace: 'normal', inherit: false, italic: false, decoration: 'none' },
  argTypes: {
    framework: frameworkControl,
    text: { control: 'text' },
    as: { control: 'select', options: ['span', 'p'] },
    size: { control: 'select', options: ['unset', ...textSizes], description: 'unsetは未指定。通常はmd、inherit時は親のサイズを使います。' },
    responsive: { control: 'boolean', description: '有効時はsizeをbase（unsetならmd）とし、640px・1024px以上のサイズを指定します。' },
    sizeSm: { control: 'select', options: ['unset', ...textSizes], if: { arg: 'responsive' } },
    sizeLg: { control: 'select', options: ['unset', ...textSizes], if: { arg: 'responsive' } },
    weight: { control: 'select', options: ['unset', ...textWeights] },
    lineHeight: { control: { type: 'number', min: 0.1, step: 0.1 }, description: '未指定時は1.5、inherit時は親から継承。' },
    tone: { control: 'select', options: textTones },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    truncate: { control: 'boolean', description: '1行省略。lineClampとの併用はできません。' },
    lineClamp: { control: { type: 'number', min: 1, step: 1 }, description: '未指定は制限なし。truncateとの併用はできません。' },
    whiteSpace: { control: 'select', options: ['normal', 'pre-line', 'pre-wrap'] },
    inherit: { control: 'boolean' }, italic: { control: 'boolean' },
    decoration: { control: 'select', options: ['none', 'underline', 'line-through'] },
    textcode: { type: 'string', control: false, table: { disable: true } },
  },
  render: (args: Args) => {
    useStoryTextArgs(args.text, args.textcode, defaultText);
    const { size, weight, responsive, sizeSm, sizeLg, textcode, ...options } = args;
    return renderComponentStory({ ...options, component: 'TText',
      size: responsive ? { base: size === 'unset' ? 'md' : size,
        sm: sizeSm === 'unset' ? undefined : sizeSm, lg: sizeLg === 'unset' ? undefined : sizeLg,
      } : size === 'unset' ? undefined : size,
      weight: weight === 'unset' ? undefined : weight,
    });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
