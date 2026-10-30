import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TIcon, type TIconProps } from 'tokiwagi-ui/vue';
import { iconSizes } from '../lib/icon-assets';
import { iconSources } from './icon-sources';

let window: Window;
const globals = new Map<string, PropertyDescriptor | undefined>();

beforeAll(() => {
  window = new Window();
  for (const [key, value] of Object.entries({
    window, document: window.document, HTMLElement: window.HTMLElement,
    Element: window.Element, SVGElement: window.SVGElement, Node: window.Node,
  })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
});

afterAll(async () => {
  try {
    await window.happyDOM.close();
  } finally {
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});

function createPage(idPrefix: string, initial: TIconProps[] = (['moon', 'tool'] as const)
  .flatMap(name => iconSizes.map(size => ({ name, size })))) {
  const icons = ref(initial);
  const page = { render: () => h('div', icons.value.map((props, index) => h(TIcon, { ...props, key: index }))) };
  return {
    icons,
    createApp() {
      const app = createSSRApp(page);
      app.config.idPrefix = idPrefix;
      return app;
    },
  };
}

function assertIcons(container: HTMLElement, props: TIconProps[]) {
  const svgs = [...container.querySelectorAll('svg')];
  expect(svgs).toHaveLength(props.length);
  const ids = [...container.querySelectorAll('[id]')].map(node => node.id);
  expect(ids).toHaveLength(props.length);
  expect(new Set(ids).size).toBe(props.length);
  svgs.forEach((svg, index) => {
    const expected = props[index]!;
    const clip = svg.querySelector('clipPath')!;
    expect(clip).not.toBeNull();
    expect(clip.id).not.toBe('');
    const references = [...svg.querySelectorAll('[clip-path]')];
    expect(references).toHaveLength(1);
    expect(references[0]!.getAttribute('clip-path')).toBe(`url(#${clip.id})`);
    expect<Element | null>(document.getElementById(clip.id)).toBe(clip);
    expect(svg.getAttribute('width')).toBe(String(expected.size ?? 24));
    expect(svg.getAttribute('height')).toBe(String(expected.size ?? 24));
    expect(svg.style.color).toBe(expected.color ?? 'currentcolor');
    expect(svg.getAttribute('class') ?? '').toBe(expected.class ?? '');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
    expect([...svg.querySelectorAll('path')].map(path => path.getAttribute('d')))
      .toEqual([...iconSources[expected.name].matchAll(/\bd="([^"]+)"/g)].map(match => match[1]!));
  });
  return ids;
}

// 8個のSSR SVGを同じidPrefixでhydrateし、全要素・ID・参照を保ったまま色だけを更新する。
test('VueのTIconはハイドレーションと色更新で全SVGとID・参照を維持し、警告が起きない', async () => {
  const page = createPage('画面:一');
  const app = page.createApp();
  const container = document.createElement('div');
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  let mounted = false;
  try {
    container.innerHTML = await renderToString(page.createApp());
    document.body.append(container);
    const html = container.innerHTML;
    const elements = [...container.querySelectorAll('svg, svg *')];
    const ids = assertIcons(container, page.icons.value);
    app.mount(container);
    mounted = true;
    await nextTick();
    expect(container.innerHTML).toBe(html);
    const hydrated = [...container.querySelectorAll('svg, svg *')];
    expect(hydrated).toHaveLength(elements.length);
    elements.forEach((element, index) => { expect(hydrated[index]).toBe(element); });
    expect(assertIcons(container, page.icons.value)).toEqual(ids);
    page.icons.value = page.icons.value.map(props => ({ ...props, color: 'var(--tkw-color-primary-blue-on-subtle)' }));
    await nextTick();
    expect(assertIcons(container, page.icons.value)).toEqual(ids);
    elements.forEach((element, index) => { expect(container.querySelectorAll('svg, svg *')[index]).toBe(element); });
  } finally {
    try {
      if (mounted) app.unmount();
      expect(warnings).not.toHaveBeenCalled();
      expect(errors).not.toHaveBeenCalled();
    } finally {
      warnings.mockRestore(); errors.mockRestore(); container.remove();
    }
  }
});

// 同じインスタンスのname・size・color・classを更新し、元に戻してもSVG本体と参照IDは変わらない。
test('VueのTIconはハイドレーション後の図柄・サイズ・色・クラス更新と復元を反映する', async () => {
  const initial: TIconProps = { name: 'moon', size: 16, class: 'before' };
  const updated: TIconProps = { name: 'tool', size: 32, class: 'after', color: 'var(--tkw-color-primary-blue-on-subtle)' };
  const page = createPage('更新', [initial]);
  const app = page.createApp();
  const container = document.createElement('div');
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  let mounted = false;
  try {
    container.innerHTML = await renderToString(page.createApp());
    document.body.append(container);
    const svg = container.querySelector('svg');
    const ids = assertIcons(container, [initial]);
    app.mount(container);
    mounted = true;
    await nextTick();
    expect(container.querySelector('svg')).toBe(svg);
    expect(assertIcons(container, [initial])).toEqual(ids);
    for (const props of [updated, initial]) {
      page.icons.value = [props];
      await nextTick();
      expect(container.querySelector('svg')).toBe(svg);
      expect(assertIcons(container, [props])).toEqual(ids);
    }
  } finally {
    try {
      if (mounted) app.unmount();
      expect(warnings).not.toHaveBeenCalled();
      expect(errors).not.toHaveBeenCalled();
    } finally {
      warnings.mockRestore(); errors.mockRestore(); container.remove();
    }
  }
});

// 同じ文書に異なるidPrefixの2アプリをhydrateし、片方の更新後も16個のIDとローカル参照を分離する。
test('複数のVueアプリはハイドレーションと更新後もIDが衝突せず、互いの表示に干渉しない', async () => {
  const pages = ['first', 'second'].map(prefix => createPage(prefix));
  const mounted: ReturnType<typeof createSSRApp>[] = [];
  const containers: HTMLElement[] = [];
  const originalIds: string[][] = [];
  const originalSvgs: SVGSVGElement[][] = [];
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  try {
    for (const page of pages) {
      const container = document.createElement('div');
      containers.push(container);
      container.innerHTML = await renderToString(page.createApp());
      document.body.append(container);
      const html = container.innerHTML;
      originalIds.push(assertIcons(container, page.icons.value));
      originalSvgs.push([...container.querySelectorAll('svg')]);
      const app = page.createApp();
      app.mount(container);
      mounted.push(app);
      await nextTick();
      expect(container.innerHTML).toBe(html);
    }
    const secondHtml = containers[1]!.innerHTML;
    pages[0]!.icons.value = pages[0]!.icons.value.map(props => ({
      ...props, name: props.name === 'moon' ? 'tool' : 'moon', size: 32, color: 'var(--tkw-color-primary-blue-on-subtle)',
    }));
    await nextTick();
    expect(containers[1]!.innerHTML).toBe(secondHtml);
    const ids = containers.flatMap((container, index) => {
      const currentIds = assertIcons(container, pages[index]!.icons.value);
      expect(currentIds).toEqual(originalIds[index]!);
      originalSvgs[index]!.forEach((svg, svgIndex) => { expect(container.querySelectorAll('svg')[svgIndex]).toBe(svg); });
      return currentIds;
    });
    expect(new Set(ids).size).toBe(16);
  } finally {
    try {
      mounted.forEach(app => app.unmount());
      expect(warnings).not.toHaveBeenCalled();
      expect(errors).not.toHaveBeenCalled();
    } finally {
      warnings.mockRestore(); errors.mockRestore(); containers.forEach(container => container.remove());
    }
  }
});
