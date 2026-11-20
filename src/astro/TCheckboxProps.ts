import type { HTMLAttributes } from 'astro/types';
import type { CheckboxOptions } from '../lib/checkbox';

export type TCheckboxProps = Omit<HTMLAttributes<'input'>,
  'type' | 'checked' | 'value' | 'defaultValue' | 'defaultChecked' | 'role' | 'aria-checked'> & CheckboxOptions & {
  checked?: boolean;
};
