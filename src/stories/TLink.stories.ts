import { linkSizes } from '../lib/link-size';
import type { Meta, StoryObj } from '@storybook/html-vite';
import { iconNames } from '../lib/icon-sources';
import { linkTones } from '../lib/link';
import type { LinkPreviewOptions } from './link-preview';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';
import { useStoryTextArgs } from './story-text-args';

type Args = Omit<LinkPreviewOptions, 'component' | 'leadingIcon' | 'trailingIcon' | 'current'> & {
  framework: Framework; textcode?: string; hrefcode?: string;
  leadingIcon: NonNullable<LinkPreviewOptions['leadingIcon']> | 'none';
  trailingIcon: NonNullable<LinkPreviewOptions['trailingIcon']> | 'none';
  'aria-current': NonNullable<LinkPreviewOptions['current']> | 'unset';
};
const iconControl = { control: { type: 'select' as const, labels: { none: 'なし' } }, options: ['none', ...iconNames] };
const meta = {
  title: 'コンポーネント/TLink', id: 'components-tlink', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'text', 'href', 'tone', 'size', 'leadingIcon', 'trailingIcon', 'target', 'rel', 'aria-current']),
  args: { framework: 'react', text: '予定の詳細を見る', href: '#link-target', tone: 'neutral', size: 'inherit', leadingIcon: 'none', trailingIcon: 'none',
    target: '_self', rel: '', 'aria-current': 'unset', textcode: '', hrefcode: '' },
  argTypes: {
    framework: frameworkControl,
    text: { control: 'text' }, href: { control: 'text' }, tone: { control: 'select', options: linkTones },
    size: { control: 'select', options: linkSizes },
    leadingIcon: iconControl, trailingIcon: iconControl,
    target: { control: 'select', options: ['_self', '_blank', '_parent', '_top'] },
    rel: { control: 'text' },
    'aria-current': { control: 'select', options: ['unset', 'false', 'page', 'location', 'step', 'date', 'time', 'true'] },
    textcode: { type: 'string', control: false, table: { disable: true } },
    hrefcode: { type: 'string', control: false, table: { disable: true } },
  },
  render: ({ text, href, textcode, hrefcode, leadingIcon, trailingIcon, 'aria-current': current, ...options }: Args) => {
    useStoryTextArgs(text, textcode, '予定の詳細を見る');
    useStoryTextArgs(href, hrefcode, '#link-target', 'href');
    return renderComponentStory({ ...options, component: 'TLink', text: text.trim() ? text : 'リンク', href: href.trim() ? href : '#link-target',
      leadingIcon: leadingIcon === 'none' ? undefined : leadingIcon, trailingIcon: trailingIcon === 'none' ? undefined : trailingIcon,
      current: current === 'unset' ? undefined : current });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
