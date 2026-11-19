import type { HTMLAttributes } from 'astro/types';
import type { SidebarDataAttributes } from '../lib/sidebar';
export type TSidebarBodyProps = HTMLAttributes<'div'> & SidebarDataAttributes;
