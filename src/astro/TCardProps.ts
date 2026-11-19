import type { CardDataAttributes } from '../lib/card';
import type { HTMLAttributes } from 'astro/types';
import type { CardOptions } from '../lib/card';
export type TCardProps = HTMLAttributes<'div'> & CardOptions & CardDataAttributes;
