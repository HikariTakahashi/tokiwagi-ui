import { defineComponent, h, type HTMLAttributes, type PropType } from 'vue';
import { logoPresentation, type LogoOptions, type LogoSize } from '../lib/logo';

export type { LogoSize } from '../lib/logo';
export type TLogoProps = LogoOptions & { class?: HTMLAttributes['class'] };

/** 固定配色のブランドロゴ。追加属性・イベント・slotは転送しない。 */
export const TLogo = defineComponent({
  name: 'TLogo',
  inheritAttrs: false,
  props: {
    size: { type: Number as PropType<LogoSize>, default: 32 },
    decorative: { type: Boolean, default: false },
    class: { type: [String, Array, Object] as PropType<HTMLAttributes['class']> },
  },
  setup(props) {
    return () => {
      const logo = logoPresentation(props.size, props.decorative);
      return h('span', { class: props.class, style: logo.frameStyle }, [
        h('img', { src: logo.src, alt: logo.alt, width: props.size, height: props.size, style: logo.imageStyle, draggable: false }),
      ]);
    };
  },
});
