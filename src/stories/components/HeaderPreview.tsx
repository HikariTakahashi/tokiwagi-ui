import { createElement, type ElementType, type ReactElement } from 'react';
import { h, type Component, type VNode } from 'vue';
import * as ReactComponents from 'tokiwagi-ui/react';
import * as VueComponents from 'tokiwagi-ui/vue';
import { renderHeaderExample, type HeaderPreviewOptions } from '../header-preview';

export function ReactHeaderPreview(options: HeaderPreviewOptions) {
  return renderHeaderExample<ReactElement>(options, (name, props, children) => {
    const component = name in ReactComponents ? ReactComponents[name as keyof typeof ReactComponents] as ElementType : name;
    return createElement(component, props, ...(children ?? []));
  });
}
export function vueHeaderPreview(options: HeaderPreviewOptions) {
  return renderHeaderExample<VNode>(options, (name, properties, children) => {
    const { className, ...props } = properties;
    const component = name in VueComponents ? VueComponents[name as keyof typeof VueComponents] as Component : name;
    return h(component, { ...props, class: className }, name in VueComponents
      ? { default: () => children }
      : children);
  });
}
