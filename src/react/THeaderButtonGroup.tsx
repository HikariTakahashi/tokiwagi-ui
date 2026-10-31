import type { ComponentPropsWithoutRef } from 'react';

export type THeaderButtonGroupProps = Omit<ComponentPropsWithoutRef<'div'>, 'role'>;

export function THeaderButtonGroup({ className, children, ...attributes }: THeaderButtonGroupProps) {
  return <div {...attributes} role="group" className={['tkw-header-button-group', className].filter(Boolean).join(' ')}>{children}</div>;
}
