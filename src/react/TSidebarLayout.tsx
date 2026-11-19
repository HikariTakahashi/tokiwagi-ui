import { Children, Fragment, isValidElement, type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { sidebarLayoutState, validateSidebarPositions, type SidebarLayoutOptions, type SidebarDataAttributes } from '../lib/sidebar';
import { TSidebar, type TSidebarProps } from './TSidebar';
import { TSidebarMain } from './TSidebarMain';

export type TSidebarLayoutProps = HTMLAttributes<HTMLDivElement> & SidebarLayoutOptions & SidebarDataAttributes;

function validateChildren(children: ReactNode) {
  const positions: number[] = [];
  function visit(nodes: ReactNode) {
    Children.forEach(nodes, child => {
      if (child == null || typeof child === 'boolean') return;
      if (!isValidElement<{ children?: ReactNode }>(child)) throw new Error('TSidebarLayoutの直下にはTSidebarとTSidebarMainを配置してください');
      if (child.type === Fragment) { visit(child.props.children); return; }
      if (child.type === TSidebarMain) positions.push(1);
      else if (child.type === TSidebar) {
        const side = (child.props as TSidebarProps).side;
        if (side !== 'left' && side !== 'right') throw new Error('TSidebarのsideにはleftまたはrightを指定してください');
        positions.push(side === 'left' ? 0 : 2);
      } else throw new Error('TSidebarLayoutの直下にはTSidebarとTSidebarMainを配置してください');
    });
  }
  visit(children);
  validateSidebarPositions(positions);
}

export function TSidebarLayout({ gap, animationDuration, className, style, children, ...attributes }: TSidebarLayoutProps) {
  validateChildren(children);
  const variables = sidebarLayoutState({ gap, animationDuration });
  return <div {...attributes} className={['tkw-sidebar-layout', className].filter(Boolean).join(' ')}
    style={{ ...variables, ...style } as CSSProperties}>{children}</div>;
}
