import type { HTMLAttributes } from 'astro/types';
import type { SidebarDataAttributes, SidebarOptions } from '../lib/sidebar';
export type TSidebarProps = HTMLAttributes<'aside'> & SidebarDataAttributes & SidebarOptions;
