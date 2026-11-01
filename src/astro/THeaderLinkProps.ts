import type { HTMLAttributes } from 'astro/types';
import type { HeaderLinkOptions } from '../lib/header-link';
export type THeaderLinkProps = Omit<HTMLAttributes<'a'>, 'href'> & HeaderLinkOptions;
