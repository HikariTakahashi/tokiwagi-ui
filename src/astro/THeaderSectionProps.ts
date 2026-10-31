import type { HTMLAttributes } from 'astro/types';
import type { HeaderSectionPosition } from '../lib/header';
export type THeaderSectionProps = HTMLAttributes<'div'> & { position: HeaderSectionPosition };
