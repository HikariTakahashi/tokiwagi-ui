import type { Meta, StoryObj } from '@storybook/html-vite';
import { expect, fn } from 'storybook/test';
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
  parameters: componentStoryParameters(['framework', 'tone', 'content', 'text', 'icon', 'active', 'selected', 'disabled']),
  args: { framework: 'react', tone: 'neutral', content: 'icon-text', text: '操作', icon: 'share', active: false, selected: 'unset', disabled: false, textcode: '' },
  argTypes: {
    framework: frameworkControl,
    tone: { control: 'select', options: headerTones },
    content: { options: ['text', 'icon', 'icon-text'], control: { type: 'select', labels: { text: '文字のみ', icon: 'アイコンのみ', 'icon-text': '文字＋アイコン' } }, description: '使用例の表示形式。iconOnlyと内容を組み立てます。' },
    text: { control: 'text', description: '表示テキスト。アイコンのみの場合は読み上げ名として使用します。空白だけの場合は「操作」を表示します。' },
    icon: { control: 'select', options: iconNames, description: '既存の全329種から選択。文字のみの場合も選択は保持します。' },
    active: { control: 'boolean', description: '背景と下線を表示。aria-pressedは変更しません。押下中はactiveの値にかかわらず下線を表示します。' },
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

// 実ボタンの操作名・有効状態を確認し、クリックとキーボードでの発火、無効時の抑止を3方式で検証する。
const play: Story['play'] = async ({ canvas, args, userEvent, step }) => {
  // Astro見本の初回生成も待ち、読み込み中の表示を検証対象にしない。
  const button = await canvas.findByRole('button', { name: args.text.trim() ? args.text : '操作' }, { timeout: 10_000 });
  const onClick = fn();
  button.addEventListener('click', onClick);
  try {
    await step('操作名と選択状態が設定に一致する', async () => {
      await expect(button).toBeVisible();
      if (args.selected === 'unset' || args.selected === undefined) {
        await expect(button).not.toHaveAttribute('aria-pressed');
      } else {
        await expect(button).toHaveAttribute('aria-pressed', String(args.selected === 'on' || args.selected === true));
      }
    });
    await step('有効時はクリックとキーボードで操作でき、無効時は発火しない', async () => {
      if (args.disabled) {
        await expect(button).toBeDisabled();
        await userEvent.click(button);
        button.focus();
        await expect(button).not.toHaveFocus();
        await userEvent.keyboard('{Enter}');
        await expect(onClick).not.toHaveBeenCalled();
      } else {
        await expect(button).toBeEnabled();
        await userEvent.click(button);
        await expect(onClick).toHaveBeenCalledTimes(1);
        await expect(button).toHaveFocus();
        await userEvent.keyboard(' ');
        await expect(onClick).toHaveBeenCalledTimes(2);
      }
    });
  } finally {
    button.removeEventListener('click', onClick);
  }
};

export const Default: Story = { play };
export const Disabled: Story = { name: '無効（React）', args: { disabled: true }, play };
export const Vue: Story = { name: '操作（Vue）', args: { framework: 'vue', content: 'icon', selected: 'on' }, play };
export const VueDisabled: Story = { name: '無効（Vue）', args: { framework: 'vue', disabled: true }, play };
export const Astro: Story = { name: '操作（Astro）', args: { framework: 'astro', content: 'text', selected: 'off' }, play };
export const AstroDisabled: Story = { name: '無効（Astro）', args: { framework: 'astro', disabled: true }, play };
