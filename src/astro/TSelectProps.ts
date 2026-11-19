import type { HTMLAttributes } from 'astro/types';
import type { SelectOptions } from '../lib/select';

export type TSelectProps = Omit<HTMLAttributes<'select'>, 'size' | 'multiple' | 'value'> & SelectOptions & {
  value?: string;
  defaultValue?: string;
  multiple?: never;
};
