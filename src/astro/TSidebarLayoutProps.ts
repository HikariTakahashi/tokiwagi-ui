import type { HTMLAttributes } from 'astro/types';
import type { SidebarDataAttributes, SidebarLayoutOptions } from '../lib/sidebar';
export type TSidebarLayoutProps = HTMLAttributes<'div'> & SidebarDataAttributes & SidebarLayoutOptions;
