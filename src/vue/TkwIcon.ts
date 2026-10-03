import { defineComponent, h, useId, type HTMLAttributes, type PropType } from 'vue';
import { iconSizes, renderIconSvg } from '../lib/icon-assets';
import { iconSources, isIconName, type IconName } from './icon-sources';

export type IconSize = typeof iconSizes[number];
export type TkwIconProps = {
  name: IconName;
  size?: IconSize;
  color?: string;
  class?: HTMLAttributes['class'];
};

/** 装飾用SVG。操作と読み上げ名は親のbutton/link、状態は併記テキストが担う。 */
export const TkwIcon = defineComponent({
  name: 'TkwIcon',
  inheritAttrs: false,
  props: {
    name: { type: String as PropType<IconName>, required: true },
    size: { type: Number as PropType<IconSize>, default: 24 },
    color: { type: String, default: 'currentColor' },
    class: { type: [String, Array, Object] as PropType<HTMLAttributes['class']> },
  },
  setup(props) {
    // useIdはsetupで一度だけ呼ぶ。任意のapp.config.idPrefixも安全なSVG IDに符号化する。
    const prefix = `tkw-${Array.from(useId(), char => char.codePointAt(0)!.toString(16)).join('-')}`;
    return () => {
      if (!isIconName(props.name)) throw new Error(`存在しないアイコン公開名: ${props.name}`);
      if (!iconSizes.includes(props.size)) throw new Error(`アイコンのサイズは16/20/24/32pxから選択してください: ${props.size}`);
      const svg = renderIconSvg(iconSources[props.name], prefix, props.size);
      return h('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        fill: 'none',
        width: props.size,
        height: props.size,
        class: props.class,
        style: { color: props.color, display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' },
        'aria-hidden': 'true',
        focusable: 'false',
        innerHTML: svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>')),
      });
    };
  },
});
