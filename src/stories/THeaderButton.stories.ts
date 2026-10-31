import type { Meta, StoryObj } from '@storybook/html-vite';
import { headerTones } from '../lib/header';
import { iconNames } from '../lib/icon-sources';
import type { HeaderPreviewOptions, HeaderButtonContent } from './header-preview';
import { useStoryTextArgs } from './story-text-args';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = Omit<HeaderPreviewOptions, 'component' | 'selected' | 'text' | 'content'> & {
  framework: Framework; selected?: boolean | 'unset' | 'off' | 'on';
  text: string; textcode?: string; content: HeaderButtonContent;
};
const meta = {
  title: 'コンポーネント/ヘッダー/THeaderButton', id: 'components-theaderbutton', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'tone', 'content', 'text', 'icon', 'selected', 'disabled']),
  args: { framework: 'react', tone: 'neutral', content: 'icon-text', text: '操作', icon: 'share', selected: 'unset', disabled: false, textcode: '' },
  argTypes: {
    framework: frameworkControl,
    tone: { control: 'select', options: headerTones },
    content: { options: ['text', 'icon', 'icon-text'], control: { type: 'select', labels: { text: '文字のみ', icon: 'アイコンのみ', 'icon-text': '文字＋アイコン' } }, description: '使用例の表示形式。iconOnlyと内容を組み立てます。' },
    text: { control: 'text', description: '表示テキスト。アイコンのみの場合は読み上げ名として使用します。空白だけの場合は「操作」を表示します。' },
    icon: { control: 'select', options: iconNames, description: '既存の全329種から選択。文字のみの場合も選択は保持します。' },
    selected: { control: 'select', options: ['unset', 'off', 'on'], mapping: { unset: undefined, off: false, on: true } },
    disabled: { control: 'boolean' },
    textcode: { type: 'string', control: false, table: { disable: true } },
  },
  render: (args: Args) => {
    useStoryTextArgs(args.text, args.textcode, '操作');
    return renderComponentStory({ ...args, component: 'THeaderButton',
      selected: args.selected === 'unset' ? undefined : args.selected === 'on' ? true : args.selected === 'off' ? false : args.selected });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
