import { useId, type ReactElement } from 'react';
import { iconSizes, renderIconSvg } from '../lib/icon-assets';
import { iconSources, isIconName, type IconName } from '../lib/icon-sources';

export type IconSize = typeof iconSizes[number];
export type TIconProps = {
  name: IconName;
  size?: IconSize;
  color?: string;
  className?: string;
};

/** 装飾用SVG。操作と読み上げ名は親のbutton/link、状態は併記テキストが担う。 */
export function TIcon({ name, size = 24, color = 'currentColor', className }: TIconProps): ReactElement {
  // useIdは条件分岐の前で呼び、React rootのidentifierPrefixも安全なSVG IDに符号化する。
  const prefix = `tkw-react-${Array.from(useId(), char => char.codePointAt(0)!.toString(16)).join('-')}`;
  if (!isIconName(name)) throw new Error(`存在しないアイコン公開名: ${name}`);
  if (!iconSizes.includes(size)) throw new Error(`アイコンのサイズは16/20/24/32pxから選択してください: ${size}`);
  const svg = renderIconSvg(iconSources[name], prefix, size);
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="none"
    width={size}
    height={size}
    className={className}
    style={{ color, display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}
    aria-hidden="true"
    focusable="false"
    dangerouslySetInnerHTML={{ __html: svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>')) }}
  />;
}
