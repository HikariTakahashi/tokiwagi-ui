import type { Meta } from '@storybook/html-vite';
import { componentStoryParameters, frameworkControl, renderComponentStory } from './components/component-story';
import type { SidebarComponent, SidebarPreviewOptions } from './components/SidebarPreview';

type Args = Omit<SidebarPreviewOptions, 'component' | 'sidebarPart'>;
export function sidebarStory(component: SidebarComponent) {
  const fields = component === 'TSidebarLayout' ? ['framework', 'view', 'leftOpen', 'rightOpen', 'width', 'gap', 'animationDuration']
    : component === 'TSidebar' ? ['framework', 'side', 'open', 'width', 'as']
    : component === 'TSidebarMain' ? ['framework', 'as'] : ['framework'];
  const controls = {
    framework: frameworkControl,
    view: { options: ['left', 'right', 'both'], control: 'select' as const },
    side: { options: ['left', 'right'], control: 'select' as const },
    open: { control: 'boolean' as const }, leftOpen: { control: 'boolean' as const }, rightOpen: { control: 'boolean' as const },
    width: { control: { type: 'number' as const, min: 1 } }, gap: { control: { type: 'number' as const, min: 0 } },
    animationDuration: { control: { type: 'number' as const, min: 0 } },
    as: { options: component === 'TSidebarMain' ? ['div', 'main'] : ['aside', 'div'], control: 'select' as const },
  };
  return {
    title: `コンポーネント/サイドバー/${component}`, id: `components-${component.toLowerCase()}`, tags: ['!autodocs'],
    parameters: componentStoryParameters(fields),
    args: { framework: 'react', view: 'left', side: 'left', open: true, leftOpen: true, rightOpen: true,
      width: 280, gap: 24, animationDuration: 200, as: component === 'TSidebarMain' ? 'div' : 'aside' },
    argTypes: Object.fromEntries(fields.map(field => [field, controls[field as keyof typeof controls]])),
    render: (args: Args) => renderComponentStory({ ...args, component, sidebarPart: true }),
  } satisfies Meta<Args>;
}
