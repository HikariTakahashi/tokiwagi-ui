import type { HTMLAttributes } from 'astro/types';
import type { TextOptions, TextDataAttributes } from '../lib/text';
export type TTextProps = Omit<HTMLAttributes<'span'>, keyof TextOptions> & TextOptions & TextDataAttributes;
