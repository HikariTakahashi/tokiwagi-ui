import { useArgs, useEffect, useRef } from 'storybook/preview-api';

/** 日本語・記号・空文字をStorybookのURLで保持するための文字コード。 */
export function encodeStoryText(text: string, defaultText: string): string {
  return text === defaultText ? '' : `u-${Array.from(text, char => char.codePointAt(0)!.toString(16)).join('-')}`;
}
export function decodeStoryText(code: unknown): string | undefined {
  if (code === 'u-') return '';
  if (typeof code !== 'string' || !/^u-[0-9a-f]{1,6}(?:-[0-9a-f]{1,6})*$/.test(code)) return undefined;
  const points = code.slice(2).split('-').map(point => parseInt(point, 16));
  if (points.some(point => point > 0x10ffff)) return undefined;
  return points.map(point => String.fromCodePoint(point)).join('');
}
export function savedStoryText(search: string): string | undefined {
  const args = new URLSearchParams(search).get('args');
  return decodeStoryText(args?.split(';').find(arg => arg.startsWith('textcode:'))?.slice('textcode:'.length));
}
export function useStoryTextArgs(text: string, textcode: string | undefined, defaultText: string) {
  const [, updateArgs] = useArgs();
  const restored = useRef(false);
  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      const saved = decodeStoryText(textcode) ?? savedStoryText(window.location.search);
      if (saved !== undefined && saved !== text) {
        updateArgs({ text: saved, textcode: encodeStoryText(saved, defaultText) });
        return;
      }
    }
    const code = encodeStoryText(text, defaultText);
    if (code !== textcode) updateArgs({ textcode: code });
  }, [text, textcode, defaultText, updateArgs]);
}
