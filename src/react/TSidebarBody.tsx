import type { HTMLAttributes } from 'react';
import type { SidebarDataAttributes } from '../lib/sidebar';
export type TSidebarBodyProps = HTMLAttributes<HTMLDivElement> & SidebarDataAttributes;
export function TSidebarBody({ className, children, ...attributes }: TSidebarBodyProps) {
  return <div {...attributes} className={['tkw-sidebar-body', className].filter(Boolean).join(' ')}>{children}</div>;
}
