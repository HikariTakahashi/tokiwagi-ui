import { version, type HTMLAttributes, type CSSProperties } from 'react';
import { sidebarState, type SidebarOptions, type SidebarDataAttributes } from '../lib/sidebar';

export type TSidebarProps = HTMLAttributes<HTMLElement> & SidebarOptions & SidebarDataAttributes;

export function TSidebar({ side, open, width, as, className, style, children, ...attributes }: TSidebarProps) {
  const state = sidebarState({ side, open, width, as });
  const Tag = state.tag;
  // React 18は未知属性として空文字、React 19はboolean属性としてinertを描画する。
  const inert = state.open ? {} : { inert: Number.parseInt(version) >= 19 ? true : '' };
  return <Tag {...attributes} {...inert as HTMLAttributes<HTMLElement>}
    aria-hidden={state.open ? attributes['aria-hidden'] : true}
    className={['tkw-sidebar', className].filter(Boolean).join(' ')}
    data-side={state.side} data-open={state.open}
    style={{ ...state.style, ...style } as CSSProperties}>
    <div className="tkw-sidebar-surface">{children}</div>
  </Tag>;
}
