import type { HTMLAttributes } from 'astro/types';
import type { LinkOptions } from '../lib/link';

export type TLinkButtonProps = Omit<HTMLAttributes<'a'>, 'href'> & LinkOptions;
