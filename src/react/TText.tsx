import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { textState, type TextOptions, type TextDataAttributes } from '../lib/text';

export type TTextProps = Omit<ComponentPropsWithoutRef<'span'>, keyof TextOptions> & TextOptions & TextDataAttributes;

export function TText({ as, size, weight, lineHeight, tone, align, truncate, lineClamp, whiteSpace, inherit,
  italic, decoration, className, style, children, ...attributes }: TTextProps) {
  const state = textState({ as, size, weight, lineHeight, tone, align, truncate, lineClamp, whiteSpace, inherit, italic, decoration });
  const Tag = state.tag;
  return <Tag {...attributes} {...state.attributes} className={['tkw-text', className].filter(Boolean).join(' ')}
    style={{ ...state.style, ...style } as CSSProperties}>{children}</Tag>;
}
