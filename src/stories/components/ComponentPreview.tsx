import { TLinkButton as ReactTLinkButton } from 'tokiwagi-ui/react';
import { TSelect as ReactTSelect } from 'tokiwagi-ui/react';
import { TSelect as VueTSelect } from 'tokiwagi-ui/vue';
import { astroSelectPreviewHtml, selectExampleOptions, type SelectPreviewOptions, type AstroSelectPreviews } from '../select-preview';
import selectsUrl from 'virtual:tkw-astro-selects';
import { AstroSelectPreview } from './SelectPreview';
import { TLinkButton as VueTLinkButton } from 'tokiwagi-ui/vue';
import { astroLinkButtonPreviewHtml, type LinkButtonPreviewOptions, type AstroLinkButtonPreviews } from '../link-button-preview';
import linkButtonsUrl from 'virtual:tkw-astro-link-buttons';
import { TLink as ReactTLink } from 'tokiwagi-ui/react';
import { TLink as VueTLink } from 'tokiwagi-ui/vue';
import { astroLinkPreviewHtml, type LinkPreviewOptions, type AstroLinkPreviews } from '../link-preview';
import linksUrl from 'virtual:tkw-astro-links';
import { useEffect, useId, useRef, useState } from 'react';
import { createApp, h, shallowRef } from 'vue';
import { TText as ReactTText } from 'tokiwagi-ui/react';
import { TText as VueTText } from 'tokiwagi-ui/vue';
import { TButton as VueTButton } from 'tokiwagi-ui/vue';
import { TButton as ReactTButton } from 'tokiwagi-ui/react';
import { astroButtonPreviewHtml, type ButtonPreviewOptions, type AstroButtonPreviews } from '../button-preview';
import buttonsUrl from 'virtual:tkw-astro-buttons';
import { astroTextPreviewHtml, type TextPreviewOptions, type AstroTextPreviews } from '../text-preview';
import textsUrl from 'virtual:tkw-astro-texts';
import { TIcon as ReactTIcon, TLogo as ReactTLogo, TBrand as ReactTBrand, type TIconProps, type TLogoProps, type TBrandProps } from 'tokiwagi-ui/react';
import { TIcon as VueTIcon, TLogo as VueTLogo, TBrand as VueTBrand } from 'tokiwagi-ui/vue';
import { AstroComponentPreview, type Framework } from './astro-component-preview';
import { astroPreviewSvg, type AstroIconPreviews } from './astro-preview';
import { createAstroPreviewLoader } from './astro-preview-loader';
import type { AstroLogoPreviews } from '../astro-logo-previews';
import { astroBrandPreviewHtml, type AstroBrandPreviews } from '../astro-brand-previews';
import iconsUrl from 'virtual:tkw-astro-icons';
import logosUrl from 'virtual:tkw-astro-logos';
import brandsUrl from 'virtual:tkw-astro-brands';
import headersUrl from 'virtual:tkw-astro-headers';
import { astroHeaderPreviewHtml } from '../astro-header-preview';
import type { HeaderPreviewOptions, AstroHeaderPreviews } from '../header-preview';
import { ReactHeaderPreview, vueHeaderPreview } from './HeaderPreview';
import { astroHeaderButtonPreviewHtml } from '../astro-header-button-preview';

export type ComponentPreviewProps = { framework: Framework } & (
  | SelectPreviewOptions
  | LinkButtonPreviewOptions
  | LinkPreviewOptions
  | ButtonPreviewOptions
  | TextPreviewOptions
  | HeaderPreviewOptions
  | { component: 'TIcon' } & Required<Pick<TIconProps, 'name' | 'size' | 'color'>>
  | { component: 'TLogo' } & Required<Pick<TLogoProps, 'size' | 'decorative'>>
  | { component: 'TBrand' } & Required<Pick<TBrandProps, 'size'>> & Pick<TBrandProps, 'text'>
);

const loadLinkButtons = createAstroPreviewLoader<AstroLinkButtonPreviews>(linkButtonsUrl);
const loadLinkButtonAssets = async () => {
  const [links, icons] = await Promise.all([loadLinkButtons(), loadIcons()]);
  return { links, icons };
};

const loadLinks = createAstroPreviewLoader<AstroLinkPreviews>(linksUrl);
const loadLinkAssets = async () => {
  const [links, icons] = await Promise.all([loadLinks(), loadIcons()]);
  return { links, icons };
};

const loadTexts = createAstroPreviewLoader<AstroTextPreviews>(textsUrl);
const loadSelects = createAstroPreviewLoader<AstroSelectPreviews>(selectsUrl);
const loadButtons = createAstroPreviewLoader<AstroButtonPreviews>(buttonsUrl);
const loadButtonAssets = async () => {
  const [buttons, icons] = await Promise.all([loadButtons(), loadIcons()]);
  return { buttons, icons };
};
const loadIcons = createAstroPreviewLoader<AstroIconPreviews>(iconsUrl);
const loadLogos = createAstroPreviewLoader<AstroLogoPreviews>(logosUrl);
const loadHeaders = createAstroPreviewLoader<AstroHeaderPreviews>(headersUrl);
const loadHeaderButtons = async () => {
  const [headers, icons] = await Promise.all([loadHeaders(), loadIcons()]);
  return { headers, icons };
};
const loadBrands = createAstroPreviewLoader<AstroBrandPreviews>(brandsUrl);

function VuePreview(args: ComponentPreviewProps) {
  const host = useRef<HTMLSpanElement & HTMLDivElement>(null);
  const id = useId();
  const [props] = useState(() => shallowRef(args));
  useEffect(() => { props.value = args; }, [args, props]);
  useEffect(() => {
    const app = createApp({ render: () => {
      const value = props.value;
      if (value.component === 'TSelect') {
        const { component, framework, value: modelValue, onValueChange, disableCard, ...options } = value;
        return h(VueTSelect, { ...options, options: selectExampleOptions(disableCard), modelValue,
          name: 'example', 'aria-label': options.label || '見本', 'onUpdate:modelValue': onValueChange });
      }
      if (value.component === 'TLinkButton') {
        return h(VueTLinkButton, { href: value.href, tone: value.tone, size: value.size, weight: value.weight, leadingIcon: value.leadingIcon, trailingIcon: value.trailingIcon,
          disabled: value.disabled, target: value.target, rel: value.rel, 'aria-current': value.current }, () => value.text);
      }
      if (value.component === 'TLink') {
        return h(VueTLink, { href: value.href, tone: value.tone, size: value.size, leadingIcon: value.leadingIcon, trailingIcon: value.trailingIcon,
          target: value.target, rel: value.rel, 'aria-current': value.current }, () => value.text);
      }
      if (value.component === 'TButton') {
        return h(VueTButton, {
          tone: value.tone, size: value.size, weight: value.weight, leadingIcon: value.leadingIcon, trailingIcon: value.trailingIcon, disabled: value.disabled,
        }, () => value.text);
      }
      if (value.component === 'THeader' || value.component === 'THeaderButton' || value.component === 'THeaderLink' || value.component === 'THeaderButtonGroup' || value.component === 'THeaderSection') return vueHeaderPreview(value);
      if (value.component === 'TText') {
        const { component, framework, text, ...options } = value;
        return h(VueTText, options, () => text);
      }
      if (value.component === 'TIcon') return h(VueTIcon, { name: value.name, size: value.size, color: value.color });
      if (value.component === 'TLogo') return h(VueTLogo, { size: value.size, decorative: value.decorative });
      return h(VueTBrand, { text: value.text, size: value.size });
    } });
    app.config.idPrefix = `tkw-preview-vue-${id}`;
    app.mount(host.current!);
    return () => app.unmount();
  }, [id, props]);
  if (args.component === 'TButton') {
    return <span ref={host} style={{ display: 'inline-flex' }} />;
  }
  return args.component.startsWith('THeader') || args.component === 'TText'
    ? <div ref={host} style={{ display: args.component === 'TText' ? 'block' : 'inline-flex' }} />
    : <span ref={host} style={{ display: 'inline-flex' }} />;
}

// Storybook専用。装飾や説明を追加せず、各公開入口の実コンポーネントだけを表示する。
export function ComponentPreview(args: ComponentPreviewProps) {
  const id = useId();
  const prefix = `tkw-preview-astro-${Array.from(id, char => char.codePointAt(0)!.toString(16)).join('-')}`;
  if (args.component === 'TSelect') {
    if (args.framework === 'vue') return <VuePreview {...args} />;
    const { component, framework, disableCard, onValueChange, ...options } = args;
    if (framework === 'react') return <ReactTSelect {...options} options={selectExampleOptions(disableCard)}
      name="example" aria-label={options.label || '見本'} onChange={event => onValueChange?.(event.currentTarget.value)} />;
    return <AstroComponentPreview load={loadSelects}>{previews =>
      <AstroSelectPreview html={astroSelectPreviewHtml(previews, args, prefix)} onValueChange={onValueChange} />
    }</AstroComponentPreview>;
  }
  if (args.component === 'TLinkButton') {
    if (args.framework === 'vue') return <VuePreview {...args} />;
    const { component, framework, text, current, ...options } = args;
    if (framework === 'react') return <ReactTLinkButton {...options} aria-current={current}>{text}</ReactTLinkButton>;
    return <AstroComponentPreview load={loadLinkButtonAssets}>{({ links, icons }) =>
      <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: astroLinkButtonPreviewHtml(links, icons, args, prefix) }} />
    }</AstroComponentPreview>;
  }
  if (args.component === 'TLink') {
    if (args.framework === 'vue') return <VuePreview {...args} />;
    const { component, framework, text, current, ...options } = args;
    if (framework === 'react') return <ReactTLink {...options} aria-current={current}>{text}</ReactTLink>;
    return <AstroComponentPreview load={loadLinkAssets}>{({ links, icons }) =>
      <span style={{ display: 'inline' }} dangerouslySetInnerHTML={{ __html: astroLinkPreviewHtml(links, icons, args, prefix) }} />
    }</AstroComponentPreview>;
  }
  if (args.component === 'TButton') {
    if (args.framework === 'vue') return <VuePreview {...args} />;
    const { component, framework, text, ...options } = args;
    if (framework === 'react') return <ReactTButton {...options}>{text}</ReactTButton>;
    return <AstroComponentPreview load={loadButtonAssets}>{({ buttons, icons }) =>
      <span style={{ display: 'inline-flex' }}
        dangerouslySetInnerHTML={{ __html: astroButtonPreviewHtml(buttons, icons, args, prefix) }} />
    }</AstroComponentPreview>;
  }
  if (args.component === 'TText') {
    if (args.framework === 'vue') return <VuePreview {...args} />;
    const { component, framework, text, ...options } = args;
    if (framework === 'react') return <ReactTText {...options}>{text}</ReactTText>;
    return <AstroComponentPreview load={loadTexts}>{previews =>
      <div dangerouslySetInnerHTML={{ __html: astroTextPreviewHtml(previews, args) }} />
    }</AstroComponentPreview>;
  }
  if (args.component === 'THeader' || args.component === 'THeaderButton' || args.component === 'THeaderLink' || args.component === 'THeaderButtonGroup' || args.component === 'THeaderSection') {
    if (args.framework === 'vue') return <VuePreview {...args} />;
    if (args.framework === 'react') return <ReactHeaderPreview {...args} />;
    if (args.component === 'THeaderButton' || args.component === 'THeaderLink') return <AstroComponentPreview load={loadHeaderButtons}>{({ headers, icons }) =>
      <div style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: astroHeaderButtonPreviewHtml(headers, icons, args, prefix) }} />
    }</AstroComponentPreview>;
    return <AstroComponentPreview load={loadHeaders}>{previews => {
      const html = astroHeaderPreviewHtml(previews, args);
      return <div style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: html.replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${prefix}-${id}"`).replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${prefix}-${id})`) }} />;
    }}</AstroComponentPreview>;
  }
  if (args.framework === 'vue') return <VuePreview {...args} />;
  if (args.framework === 'react') {
    if (args.component === 'TIcon') return <ReactTIcon name={args.name} size={args.size} color={args.color} />;
    if (args.component === 'TLogo') return <ReactTLogo size={args.size} decorative={args.decorative} />;
    return <ReactTBrand text={args.text} size={args.size} />;
  }
  if (args.component === 'TIcon') return <AstroComponentPreview load={loadIcons}>{previews =>
    <span style={{ display: 'inline-flex', color: args.color }} dangerouslySetInnerHTML={{ __html: astroPreviewSvg(previews, args.name, args.size, prefix) }} />
  }</AstroComponentPreview>;
  if (args.component === 'TLogo') return <AstroComponentPreview load={loadLogos}>{previews =>
    <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: previews[args.size][args.decorative ? 'decorative' : 'standalone'] }} />
  }</AstroComponentPreview>;
  return <AstroComponentPreview load={loadBrands}>{previews =>
    <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: astroBrandPreviewHtml(previews, args.size, args.text) }} />
  }</AstroComponentPreview>;
}
