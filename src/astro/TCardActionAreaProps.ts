import type { CardDataAttributes } from '../lib/card';
import type { HTMLAttributes } from 'astro/types';
import type { CardActionAreaOptions } from '../lib/card';
export type TCardActionAreaProps = Omit<HTMLAttributes<'a'>, 'href'> & CardActionAreaOptions & CardDataAttributes;
