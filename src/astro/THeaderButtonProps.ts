import type { HTMLAttributes } from 'astro/types';
import type { HeaderButtonOptions } from '../lib/header';
export type THeaderButtonProps = HTMLAttributes<'button'> & HeaderButtonOptions;
