import { useArgs, useEffect, useRef } from 'storybook/preview-api';
import { brandName } from '../lib/brand';

// Storybook標準のURL引数は日本語や記号を除外するため、文字コードも保存する。
export function encodeBrandText(text: string): string {
  return text === brandName ? '' : `u-${Array.from(text, char => char.codePointAt(0)!.toString(16)).join('-')}`;
}

export function decodeBrandText(code: unknown): string | undefined {
  if (typeof code !== 'string' || !/^u-[0-9a-f]{1,6}(?:-[0-9a-f]{1,6})*$/.test(code)) return undefined;
  const points = code.slice(2).split('-').map(point => parseInt(point, 16));
  if (points.some(point => point > 0x10ffff)) return undefined;
  return points.map(point => String.fromCodePoint(point)).join('');
}

export function savedBrandText(search: string): string | undefined {
  const args = new URLSearchParams(search).get('args');
  return decodeBrandText(args?.split(';').find(arg => arg.startsWith('textcode:'))?.slice('textcode:'.length));
}

export function useBrandTextArgs(text: string, textcode?: string) {
  const [, updateArgs] = useArgs();
  const restored = useRef(false);
  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      // 初回はControlsへ渡る前の保存値もURLから復元する。
      const saved = decodeBrandText(textcode) ?? savedBrandText(window.location.search);
      if (saved !== undefined && saved !== text) {
        updateArgs({ text: saved, textcode: encodeBrandText(saved) });
        return;
      }
    }
    const code = encodeBrandText(text);
    if (code !== textcode) updateArgs({ textcode: code });
  }, [text, textcode, updateArgs]);
}
