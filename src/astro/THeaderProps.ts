import type { HTMLAttributes } from 'astro/types';
import type { HeaderBackgroundColor } from '../lib/header-background';
export type THeaderProps = HTMLAttributes<'header'> & { scrollLabel?: string; backgroundColor?: HeaderBackgroundColor };
