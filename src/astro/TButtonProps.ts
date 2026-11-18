import type { HTMLAttributes } from 'astro/types';
import type { ButtonOptions } from '../lib/button';

export type TButtonProps = HTMLAttributes<'button'> & ButtonOptions;
