import type { CardDataAttributes } from '../lib/card';
import type { HTMLAttributes } from 'astro/types';
export type TCardHeaderProps = HTMLAttributes<'div'> & CardDataAttributes;
