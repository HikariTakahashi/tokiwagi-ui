import { expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TIcon, iconNames, isIconName, type IconName, type IconSize } from './index';
import { iconSources } from './icon-sources';
import { iconSizes } from '../lib/icon-assets';

const render = (name: IconName, size: IconSize = 24) => renderToString(createSSRApp({ render: () => h(TIcon, { name, size }) }));
const geometry = (svg: string) => svg.match(/\b(?:d|viewBox|stroke-width|stroke-linecap|stroke-linejoin|fill-rule|clip-rule)="[^"]*"/g);

// 原本の追加・削除・差し替え後も、生成された公開名とraw importが329個の原本に一致する。
test('Vueの公開名と読み込むSVGは全原本と一致する', () => {
  const directory = new URL('../../icons/', import.meta.url);
  expect<readonly string[]>(iconNames).toEqual(readdirSync(directory).sort());
  expect(iconNames).toHaveLength(329);
  for (const name of iconNames) expect(iconSources[name]).toBe(readFileSync(new URL(`${name}/${name}.svg`, directory), 'utf8'));
});

// 全図柄を4サイズで実際にVue SSRし、座標・線幅・白いクリッピング・透明な塗りを保持する。
test('Vueコンポーネントは全原本の形状を4サイズで維持する', async () => {
  for (const name of iconNames) for (const size of iconSizes) {
    const svg = await render(name, size);
    const source = iconSources[name];
    expect(geometry(svg)).toEqual(geometry(source));
    expect(svg).toContain(`width="${size}" height="${size}"`);
    expect(svg).not.toMatch(/(?:fill|stroke)="black"/);
    expect(svg.match(/currentColor"/g)?.length).toBe(source.match(/(?:fill|stroke)="black"/g)?.length);
    for (const fill of ['none', 'white']) expect(svg.match(new RegExp(`fill="${fill}"`, 'g'))?.length).toBe(source.match(new RegExp(`fill="${fill}"`, 'g'))?.length);
  }
});

// 同じ図柄を8回SSRし、各参照が自分のSVG内のIDを指し、再レンダーでも同じIDになる。
test('moonとtoolの複数表示とSSRでIDの衝突や揺れが起きない', async () => {
  const page = () => {
    const app = createSSRApp({ render: () => h('div', ['moon', 'tool'].flatMap(name => iconSizes.map(size => h(TIcon, { name: name as IconName, size })))) });
    app.config.idPrefix = '画面:一';
    return renderToString(app);
  };
  const html = await page();
  expect(await page()).toBe(html);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]!);
  expect(new Set(ids).size).toBe(8);
  for (const svg of html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) {
    const id = svg[0].match(/\bid="([^"]+)"/)![1];
    expect(svg[0]).toContain(`url(#${id})`);
  }
});

// 複数Vueアプリが同じ文書に存在するとき、利用側のidPrefixで参照IDを分離できる。
test('複数のVueアプリでID接頭辞を分けられる', async () => {
  const html = await Promise.all(['first', 'second'].map(idPrefix => {
    const app = createSSRApp({ render: () => h(TIcon, { name: 'moon' }) });
    app.config.idPrefix = idPrefix;
    return renderToString(app);
  }));
  expect(html[0]!.match(/\bid="([^"]+)"/)![1]).not.toBe(html[1]!.match(/\bid="([^"]+)"/)![1]);
});

// JSや外部入力で型を迂回した場合も、不正名・prototype名・非対応サイズを明示的に拒否する。
test('存在しない公開名と非対応サイズは日本語エラーになる', async () => {
  expect(isIconName('bell')).toBe(true);
  for (const name of ['missing', '__proto__', 'toString']) {
    expect(isIconName(name)).toBe(false);
    expect(await render(name as IconName).catch((error: Error) => error.message)).toBe(`存在しないアイコン公開名: ${name}`);
  }
  expect(await render('bell', 18 as IconSize).catch((error: Error) => error.message)).toContain('16/20/24/32px');
});

// 装飾SVGの属性を固定し、クラスとトークン色を受け取り、操作要素側の読み上げ名を保つ。
test('色・クラスを指定でき、アクセシビリティ属性は操作要素と分担する', async () => {
  const html = await renderToString(createSSRApp({ render: () => h('button', { 'aria-label': '通知一覧を開く' }, [
    h(TIcon, { name: 'bell', color: 'var(--tkw-color-primary-blue-on)', class: ['notification-icon', { selected: true }], 'aria-hidden': false, tabindex: 0, width: 99 }),
  ]) }));
  expect(html).toContain('aria-label="通知一覧を開く"');
  expect(html).toContain('class="notification-icon selected"');
  expect(html).toContain('color:var(--tkw-color-primary-blue-on)');
  expect(html).toContain('aria-hidden="true" focusable="false"');
  expect(html).toContain('width="24" height="24"');
  expect(html).not.toContain('tabindex');
});
