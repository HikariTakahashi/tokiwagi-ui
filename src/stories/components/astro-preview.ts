import type { IconName } from '../../lib/icon-sources';
import type { IconSize } from '../../astro/TIconProps';

export type AstroIconPreviews = Record<IconName, Record<IconSize, string>>;

/** 実際のAstro出力を再利用し、同じHTMLを複数箇所へ置く際のIDだけを表示インスタンスごとに分離する。 */
export function astroPreviewSvg(previews: AstroIconPreviews, name: IconName, size: IconSize, prefix: string): string {
  if (!/^[a-zA-Z][\w-]*$/.test(prefix)) throw new Error('AstroプレビューのID接頭辞が不正です');
  const svg = previews[name]?.[size];
  if (!svg) throw new Error(`Astroプレビューがありません: ${name} / ${size}px`);
  const ids = new Map([...svg.matchAll(/\bid="([^"]+)"/g)].map((match, index) => [match[1]!, `${prefix}-${index}`]));
  return svg
    .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${ids.get(id)}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => {
      const target = ids.get(id);
      if (!target) throw new Error(`Astroプレビュー内の参照先がありません: ${id}`);
      return `url(#${target})`;
    });
}
