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
    const host = document.createElement('span');
    host.style.display = 'inline-flex';
    return { host, root: createRoot(host) };
  }, []);
  useEffect(() => () => preview.root.unmount(), [preview]);
  useEffect(() => {
    flushSync(() => preview.root.render(createElement(ComponentPreview, props)));
  }, [preview, props]);
  return preview.host;
}
