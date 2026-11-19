import type { HTMLAttributes } from 'astro/types';
import type { LinkButtonOptions } from '../lib/link';

export type TLinkButtonProps = Omit<HTMLAttributes<'a'>, 'href'> & LinkButtonOptions;
