import { parseIconSearchLabels } from './icon-search-labels';

/** 図形は icons/<公開名>/ の原本から読み込む。表示用変換で座標や線幅を編集しない。 */
export const iconCategories = [
  ['basic', '基本アイコン'], ['calendar', 'カレンダー'], ['task', 'タスク'],
  ['circle', '円枠'], ['square', '四角枠'], ['triangle', '三角枠'],
] as const;
export type IconCategory = typeof iconCategories[number][0];
export type IconAsset = { name: string; category: IconCategory; svg: string; href: string; searchLabels: readonly string[] };
export const iconSizes = [16, 20, 24, 32] as const;

export function createIconCatalog(sources: Record<string, string>, documents: Record<string, string>): IconAsset[] {
  const details = new Map<string, string>();
  for (const [path, source] of Object.entries(documents)) {
    const name = path.split('/').at(-2)!;
    if (details.has(name)) throw new Error(`個別READMEが重複しています: ${name}`);
    details.set(name, source);
  }
  const names = new Set<string>();
  const catalog = Object.entries(sources).map(([path, svg]) => {
    const name = path.split('/').pop()!.replace(/\.svg$/, '');
    const directory = path.split('/').at(-2);
    if (!/^[a-z]+(?:-[a-z]+)*$/.test(name) || names.has(name)) {
      throw new Error(`不正または重複したアイコン名: ${name}`);
    }
    if (directory !== name) throw new Error(`SVGの配置先がアイコン名と一致しません: ${name}`);
    names.add(name);
    if (!svg.includes('viewBox="0 0 32 32"')) throw new Error(`不正なviewBox: ${name}`);
    const category = iconCategories.find(([key]) => key !== 'basic' && (name === key || name.startsWith(`${key}-`)))?.[0] ?? 'basic';
    const source = details.get(name);
    if (source === undefined) throw new Error(`個別READMEがありません: ${name}`);
    const searchLabels = parseIconSearchLabels(source, name);
    return { name, category, svg, href: `?path=/docs/icons-${name}--docs`, searchLabels };
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
  for (const name of details.keys()) {
    if (!names.has(name)) throw new Error(`個別READMEに対応する原本SVGがありません: ${name}`);
  }
  return catalog;
}

export function filterIcons(icons: IconAsset[], query: string, category: IconCategory | 'all') {
  const search = query.trim().toLowerCase();
  return icons.filter(icon => (category === 'all' || icon.category === category)
    && (icon.name.includes(search) || icon.searchLabels.some(label => label.toLowerCase().includes(search))));
}

/** 呼び出し側がインスタンスごとに異なるprefixを渡す。入力は収録済み原本のみ。 */
export function renderIconSvg(svg: string, prefix: string, size: number = 32): string {
  if (!/^[a-zA-Z][\w-]*$/.test(prefix)) throw new Error('SVGのID接頭辞が不正です');
  if (!Number.isFinite(size) || size <= 0) throw new Error('SVGのサイズが不正です');
  const ids = new Map([...svg.matchAll(/\bid="([^"]+)"/g)].map((match, index) => [match[1]!, `${prefix}-${index}`]));
  return svg
    .replace(/\b(fill|stroke)="black"/g, '$1="currentColor"')
    .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${ids.get(id)}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => {
      const target = ids.get(id);
      if (!target) throw new Error(`SVG内の参照先がありません: ${id}`);
      return `url(#${target})`;
    })
    .replace(/<svg\b[^>]*>/, root => root
      .replace(/\b(width|height)="[^"]*"/g, `$1="${size}"`)
      .replace('<svg', '<svg aria-hidden="true" focusable="false"'));
}

export function originalIconUrl(icon: IconAsset): string {
  return `./icon-assets/${icon.name}/${icon.name}.svg`;
}
