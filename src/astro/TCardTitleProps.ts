import type { CardDataAttributes } from '../lib/card';
import type { HTMLAttributes } from 'astro/types';
import type { CardTitleOptions } from '../lib/card';
export type TCardTitleProps = HTMLAttributes<'h3'> & CardTitleOptions & CardDataAttributes;
