import type { HTMLAttributes } from 'astro/types';
import type { LinkOptions } from '../lib/link';

export type TLinkProps = Omit<HTMLAttributes<'a'>, 'href'> & LinkOptions;
