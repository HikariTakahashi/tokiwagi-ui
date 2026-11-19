import type { Meta, StoryObj } from '@storybook/html-vite';
import { cardVariants, cardSizes, cardTags } from '../lib/card';
import { cardViews, cardExampleDefaults, type CardPreviewOptions } from './card-preview';
import type { Framework } from './components/astro-component-preview';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';
import { useStoryTextArgs } from './story-text-args';

type Args = Omit<CardPreviewOptions, 'component'> & { framework: Framework; titlecode?: string; descriptioncode?: string; textcode?: string; hrefcode?: string };
const fields = ['framework', 'view', 'variant', 'size', 'as', 'title', 'description', 'text', 'href'];
const meta = {
  title: 'コンポーネント/TCard', id: 'components-tcard', tags: ['!autodocs'],
  parameters: componentStoryParameters(fields),
  args: { framework: 'react', view: 'basic', variant: 'outline', size: 'md', as: 'div', ...cardExampleDefaults },
  argTypes: {
    framework: frameworkControl,
    view: { control: { type: 'select', labels: { basic: '基本', task: 'タスク', media: 'メディア', link: '全体リンク' } }, options: cardViews },
    variant: { control: 'select', options: cardVariants },
    size: { control: 'select', options: cardSizes },
    as: { control: 'select', options: cardTags },
    title: { control: 'text' }, description: { control: 'text' }, text: { control: 'text' }, href: { control: 'text' },
  },
  render: (args: Args) => {
    useStoryTextArgs(args.title, args.titlecode, cardExampleDefaults.title, 'title');
    useStoryTextArgs(args.description, args.descriptioncode, cardExampleDefaults.description, 'description');
    useStoryTextArgs(args.text, args.textcode, cardExampleDefaults.text);
    useStoryTextArgs(args.href, args.hrefcode, cardExampleDefaults.href, 'href');
    return renderComponentStory({ component: 'TCard', framework: args.framework, view: args.view,
      variant: args.variant, size: args.size, as: args.as, title: args.title, description: args.description,
      text: args.text, href: args.href.trim() ? args.href : cardExampleDefaults.href });
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
