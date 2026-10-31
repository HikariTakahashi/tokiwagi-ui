import { originalIconUrl, type IconSearchEntry } from '../../lib/icon-assets';

/** 成功・取得中の原本を共有し、失敗した取得はキャッシュせず再試行を可能にする。 */
export function createIconSvgLoader() {
  const pending = new Map<string, Promise<string>>();
  return (icon: IconSearchEntry) => {
    const url = originalIconUrl(icon);
    let request = pending.get(url);
    if (!request) {
      request = fetch(url).then(async response => {
        if (!response.ok) throw new Error(`SVGの読み込みに失敗しました: ${icon.name} / ${response.status}`);
        const svg = await response.text();
        if (!svg.startsWith('<svg ') || !svg.includes('viewBox="0 0 32 32"')) {
          throw new Error(`不正なSVGです: ${icon.name}`);
        }
        return svg;
      }).catch(error => { pending.delete(url); throw error; });
      pending.set(url, request);
    }
    return request;
  };
}

export const loadIconSvg = createIconSvgLoader();
