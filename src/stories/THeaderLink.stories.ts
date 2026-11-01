import type { Meta, StoryObj } from '@storybook/html-vite';
import { headerTones } from '../lib/header';
import { iconNames } from '../lib/icon-sources';
import type { HeaderPreviewOptions } from './header-preview';
import { useStoryTextArgs } from './story-text-args';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';

type Args = Omit<HeaderPreviewOptions, 'component' | 'disabled' | 'text' | 'href' | 'current'> & {
  framework: Framework; text: string; textcode?: string; href: string; hrefcode?: string;
  current?: HeaderPreviewOptions['current'] | 'unset';
};
const meta = {
  title: 'コンポーネント/ヘッダー/THeaderLink', id: 'components-theaderlink', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'tone', 'content', 'text', 'icon', 'href', 'target', 'aria-current']),
  args: { framework: 'react', tone: 'neutral', content: 'icon-text', text: 'リンク', icon: 'share',
    href: '#header-link-target', target: '_self', current: 'unset', textcode: '', hrefcode: '' },
  argTypes: {
    framework: frameworkControl,
    tone: { control: 'select', options: headerTones },
    content: { options: ['text', 'icon', 'icon-text'], control: { type: 'select', labels: { text: '文字のみ', icon: 'アイコンのみ', 'icon-text': '文字＋アイコン' } } },
    text: { control: 'text', description: 'アイコンのみでは読み上げ名に使用。空白だけの場合は「リンク」を表示します。' },
    icon: { control: 'select', options: iconNames },
    href: { control: 'text', description: '空白だけの場合、見本は#header-link-targetへリンクします。' },
    target: { control: 'select', options: ['_self', '_blank', '_parent', '_top'] },
    current: { name: 'aria-current', control: 'select', options: ['unset', 'false', 'page', 'location', 'step', 'date', 'time', 'true'] },
    textcode: { type: 'string', control: false, table: { disable: true } },
    hrefcode: { type: 'string', control: false, table: { disable: true } },
  },
  render: (args: Args) => {
    useStoryTextArgs(args.text, args.textcode, 'リンク');
    useStoryTextArgs(args.href, args.hrefcode, '#header-link-target', 'href');
    return renderComponentStory({ ...args, component: 'THeaderLink', disabled: false,
      current: args.current === 'unset' ? undefined : args.current });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
