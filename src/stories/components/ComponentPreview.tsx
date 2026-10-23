import { useEffect, useId, useRef, useState } from 'react';
import { createApp, h, shallowRef } from 'vue';
import { TIcon as ReactTIcon, TLogo as ReactTLogo, TBrand as ReactTBrand, type TIconProps, type TLogoProps, type TBrandProps } from 'tokiwagi-ui/react';
import { TIcon as VueTIcon, TLogo as VueTLogo, TBrand as VueTBrand } from 'tokiwagi-ui/vue';
import { AstroComponentPreview, type Framework } from './astro-component-preview';
import { astroPreviewSvg, type AstroIconPreviews } from './astro-preview';
import { createAstroPreviewLoader } from './astro-preview-loader';
import type { AstroLogoPreviews } from '../astro-logo-previews';
import type { AstroBrandPreviews } from '../astro-brand-previews';
import iconsUrl from 'virtual:tkw-astro-icons';
import logosUrl from 'virtual:tkw-astro-logos';
import brandsUrl from 'virtual:tkw-astro-brands';

export type ComponentPreviewProps = { framework: Framework } & (
  | { component: 'TIcon' } & Required<Pick<TIconProps, 'name' | 'size' | 'color'>>
  | { component: 'TLogo' } & Required<Pick<TLogoProps, 'size' | 'decorative'>>
  | { component: 'TBrand' } & Required<Pick<TBrandProps, 'size'>>
);

const loadIcons = createAstroPreviewLoader<AstroIconPreviews>(iconsUrl);
const loadLogos = createAstroPreviewLoader<AstroLogoPreviews>(logosUrl);
const loadBrands = createAstroPreviewLoader<AstroBrandPreviews>(brandsUrl);

function VuePreview(args: ComponentPreviewProps) {
  const host = useRef<HTMLSpanElement>(null);
  const id = useId();
  const [props] = useState(() => shallowRef(args));
  useEffect(() => { props.value = args; }, [args, props]);
  useEffect(() => {
    const app = createApp({ render: () => {
      const value = props.value;
      if (value.component === 'TIcon') return h(VueTIcon, { name: value.name, size: value.size, color: value.color });
      if (value.component === 'TLogo') return h(VueTLogo, { size: value.size, decorative: value.decorative });
      return h(VueTBrand, { size: value.size });
    } });
    app.config.idPrefix = `tkw-preview-vue-${id}`;
    app.mount(host.current!);
    return () => app.unmount();
  }, [id, props]);
  return <span ref={host} style={{ display: 'inline-flex' }} />;
}

// Storybook専用。装飾や説明を追加せず、各公開入口の実コンポーネントだけを表示する。
export function ComponentPreview(args: ComponentPreviewProps) {
  const id = useId();
  const prefix = `tkw-preview-astro-${Array.from(id, char => char.codePointAt(0)!.toString(16)).join('-')}`;
  if (args.framework === 'vue') return <VuePreview {...args} />;
  if (args.framework === 'react') {
    if (args.component === 'TIcon') return <ReactTIcon name={args.name} size={args.size} color={args.color} />;
    if (args.component === 'TLogo') return <ReactTLogo size={args.size} decorative={args.decorative} />;
    return <ReactTBrand size={args.size} />;
  }
  if (args.component === 'TIcon') return <AstroComponentPreview load={loadIcons}>{previews =>
    <span style={{ display: 'inline-flex', color: args.color }} dangerouslySetInnerHTML={{ __html: astroPreviewSvg(previews, args.name, args.size, prefix) }} />
  }</AstroComponentPreview>;
  if (args.component === 'TLogo') return <AstroComponentPreview load={loadLogos}>{previews =>
    <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: previews[args.size][args.decorative ? 'decorative' : 'standalone'] }} />
  }</AstroComponentPreview>;
  return <AstroComponentPreview load={loadBrands}>{previews =>
    <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: previews[args.size] }} />
  }</AstroComponentPreview>;
}
