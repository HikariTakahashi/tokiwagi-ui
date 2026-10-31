import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';
import type { LogoSize } from '../lib/logo';
import { brandName, resolveBrandText, brandStyle, brandNameStyle } from '../lib/brand';
import { TLogo } from './TLogo';

export type TBrandProps = { text?: string; size?: LogoSize; class?: HTMLAttributes['class'] };

/** ロゴと指定テキストの静的表示。追加属性・イベント・slotは転送しない。 */
export const TBrand = defineComponent({
  name: 'TBrand',
  inheritAttrs: false,
  props: {
    text: { type: String, default: brandName },
    size: { type: Number as PropType<LogoSize>, default: 32 },
    class: { type: [String, Array, Object] as PropType<HTMLAttributes['class']> },
  },
  setup(props) {
    return () => h('span', { class: props.class, style: brandStyle }, [
      h(TLogo, { size: props.size, decorative: true }),
      h('span', { style: brandNameStyle }, resolveBrandText(props.text)),
    ]);
  },
});
