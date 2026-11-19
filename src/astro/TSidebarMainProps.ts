import type { HTMLAttributes } from 'astro/types';
import type { SidebarDataAttributes, SidebarMainOptions } from '../lib/sidebar';
export type TSidebarMainProps = HTMLAttributes<'div'> & SidebarDataAttributes & SidebarMainOptions;
