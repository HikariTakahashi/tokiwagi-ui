import type { HTMLAttributes } from 'react';
import type { SidebarDataAttributes } from '../lib/sidebar';
export type TSidebarFooterProps = HTMLAttributes<HTMLDivElement> & SidebarDataAttributes;
export function TSidebarFooter({ className, children, ...attributes }: TSidebarFooterProps) {
  return <div {...attributes} className={['tkw-sidebar-footer', className].filter(Boolean).join(' ')}>{children}</div>;
}
