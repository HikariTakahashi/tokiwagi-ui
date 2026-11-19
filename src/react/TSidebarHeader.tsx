import type { HTMLAttributes } from 'react';
import type { SidebarDataAttributes } from '../lib/sidebar';
export type TSidebarHeaderProps = HTMLAttributes<HTMLDivElement> & SidebarDataAttributes;
export function TSidebarHeader({ className, children, ...attributes }: TSidebarHeaderProps) {
  return <div {...attributes} className={['tkw-sidebar-header', className].filter(Boolean).join(' ')}>{children}</div>;
}
