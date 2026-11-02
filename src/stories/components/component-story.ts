import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo } from 'storybook/preview-api';
import { ComponentPreview, type ComponentPreviewProps } from './ComponentPreview';

export const frameworkControl = {
  options: ['react', 'vue', 'astro'],
  control: { type: 'select' as const, labels: { react: 'React', vue: 'Vue', astro: 'Astro' } },
};

export function componentStoryParameters(controls: string[]) {
  return {
    layout: 'centered',
    controls: { disable: false, include: controls, disableSaveFromUI: true },
    options: { layout: { showPanel: true } },
  };
}

// args更新では同じrootを使い、離脱時にReactと内部Vueをまとめて解放する。
export function renderComponentStory(props: ComponentPreviewProps) {
  const preview = useMemo(() => {
    const host = document.createElement(props.component.startsWith('THeader') || props.component === 'TText' ? 'div' : 'span');
    host.style.display = props.component === 'TText' ? 'block' : 'inline-flex';
    if (props.component === 'TText') host.style.width = 'min(32rem, calc(100vw - 2rem))';
    return { host, root: createRoot(host) };
  }, []);
  useEffect(() => () => preview.root.unmount(), [preview]);
  // Storybookのeffectはplay完了後に走るため、検証開始前に実コンポーネントを描画する。
  flushSync(() => preview.root.render(createElement(ComponentPreview, props)));
  return preview.host;
}
