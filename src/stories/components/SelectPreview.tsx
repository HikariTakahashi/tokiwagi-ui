import { useEffect, useRef } from 'react';

/** 静的Astro出力のネイティブイベントをControlsへ渡し、差し替え・離脱時に解除する。 */
export function AstroSelectPreview({ html, onValueChange }: { html: string; onValueChange?: (value: string) => void }) {
  const host = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const input = host.current?.querySelector('select');
    if (!input) return;
    const change = () => onValueChange?.(input.value);
    input.addEventListener('change', change);
    return () => input.removeEventListener('change', change);
  }, [html, onValueChange]);
  return <span ref={host} style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
