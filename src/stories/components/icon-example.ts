import { iconsByName } from '../../lib/icon-catalog';
import { renderIconPreview } from './icon-preview';

export function renderIconExample(name: string): HTMLElement {
  const icon = iconsByName.get(name);
  if (!icon) throw new Error(`アイコンが見つかりません: ${name}`);
  return renderIconPreview(icon);
}
