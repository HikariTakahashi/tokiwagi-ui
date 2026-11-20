import { linkButtonSizes } from '../lib/link-size';
import type { Meta, StoryObj } from '@storybook/html-vite';
import { iconNames } from '../lib/icon-sources';
import { buttonTones } from '../lib/button';
import { textWeights } from '../lib/text';
import type { LinkButtonPreviewOptions } from './link-button-preview';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';
import { useStoryTextArgs } from './story-text-args';

type Args = Omit<LinkButtonPreviewOptions, 'component' | 'weight' | 'leadingIcon' | 'trailingIcon' | 'current'> & {
  framework: Framework; textcode?: string; hrefcode?: string;
  weight: NonNullable<LinkButtonPreviewOptions['weight']> | 'unset';
  leadingIcon: NonNullable<LinkButtonPreviewOptions['leadingIcon']> | 'none';
  trailingIcon: NonNullable<LinkButtonPreviewOptions['trailingIcon']> | 'none';
  'aria-current': NonNullable<LinkButtonPreviewOptions['current']> | 'unset';
};
const iconControl = { control: { type: 'select' as const, labels: { none: 'なし' } }, options: ['none', ...iconNames] };
const meta = {
  title: 'コンポーネント/TLinkButton', id: 'components-tlinkbutton', tags: ['!autodocs'],
  parameters: componentStoryParameters(['framework', 'text', 'href', 'tone', 'size', 'weight', 'leadingIcon', 'trailingIcon', 'disabled', 'target', 'rel', 'aria-current']),
  args: { framework: 'react', text: 'カレンダーを開く', href: '#link-button-target', tone: 'neutral', size: 'lg', weight: 'unset', leadingIcon: 'none', trailingIcon: 'none',
    disabled: false, target: '_self', rel: '', 'aria-current': 'unset', textcode: '', hrefcode: '' },
  argTypes: {
    framework: frameworkControl,
    text: { control: 'text' }, href: { control: 'text' }, tone: { control: 'select', options: buttonTones },
    size: { control: 'select', options: linkButtonSizes },
    weight: { control: { type: 'select', labels: { unset: '未指定（継承）' } }, options: ['unset', ...textWeights] },
    leadingIcon: iconControl, trailingIcon: iconControl,
    disabled: { control: 'boolean' },
    target: { control: 'select', options: ['_self', '_blank', '_parent', '_top'] },
    rel: { control: 'text' },
    'aria-current': { control: 'select', options: ['unset', 'false', 'page', 'location', 'step', 'date', 'time', 'true'] },
    textcode: { type: 'string', control: false, table: { disable: true } },
    hrefcode: { type: 'string', control: false, table: { disable: true } },
  },
  render: ({ text, href, textcode, hrefcode, weight, leadingIcon, trailingIcon, 'aria-current': current, ...options }: Args) => {
    useStoryTextArgs(text, textcode, 'カレンダーを開く');
    useStoryTextArgs(href, hrefcode, '#link-button-target', 'href');
    return renderComponentStory({ ...options, component: 'TLinkButton', text: text.trim() ? text : 'リンク', href: href.trim() ? href : '#link-button-target',
      weight: weight === 'unset' ? undefined : weight,
      leadingIcon: leadingIcon === 'none' ? undefined : leadingIcon, trailingIcon: trailingIcon === 'none' ? undefined : trailingIcon,
      current: current === 'unset' ? undefined : current });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = { name: 'TLinkButton' };
