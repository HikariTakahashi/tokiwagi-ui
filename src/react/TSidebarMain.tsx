import type { HTMLAttributes } from 'react';
import { sidebarMainTag, type SidebarMainOptions, type SidebarDataAttributes } from '../lib/sidebar';

export type TSidebarMainProps = HTMLAttributes<HTMLElement> & SidebarMainOptions & SidebarDataAttributes;
export function TSidebarMain({ as, className, children, ...attributes }: TSidebarMainProps) {
  const Tag = sidebarMainTag(as);
  return <Tag {...attributes} className={['tkw-sidebar-main', className].filter(Boolean).join(' ')}>{children}</Tag>;
}
