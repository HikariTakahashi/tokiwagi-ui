import { expect, test } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Window } from 'happy-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { headerTones } from '../lib/header';
import { headerPreviewKey, type AstroHeaderPreviews } from './header-preview';
import { ReactHeaderPreview } from './components/HeaderPreview';
import { iconNames } from '../lib/icon-sources';
import { astroHeaderButtonPreviewHtml } from './astro-header-button-preview';
import type { AstroIconPreviews } from './components/astro-preview';
import { encodeStoryText, decodeStoryText, savedStoryText } from './story-text-args';

// 実Astro部品の生成結果とReact合成例の操作順・名前を照合し、Controlsの全条件を静的Storybookへ収録する。
test('Astroのヘッダー見本は全195条件を収録し、Reactと同じ操作部品を表示する', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-header-test-'));
  const window = new Window();
  try {
    const output = join(directory, 'previews.json');
    const process = Bun.spawn(['bun', 'scripts/render-astro-header-previews.ts', output], {
      cwd: new URL('../../', import.meta.url).pathname, stdout: 'ignore', stderr: 'pipe',
    });
    const error = await new Response(process.stderr).text();
    expect(await process.exited, error).toBe(0);
    const previews = JSON.parse(await readFile(output, 'utf8')) as AstroHeaderPreviews;
    expect(Object.keys(previews)).toHaveLength(195);
    for (const position of ['left', 'center', 'right'] as const) {
      const options = { component: 'THeaderSection' as const, tone: 'neutral' as const, disabled: false, position };
      const host = window.document.createElement('div'); host.innerHTML = previews[headerPreviewKey(options)]!;
      expect(host.querySelectorAll('.tkw-header-section')).toHaveLength(1);
      expect(host.querySelector('.tkw-header-section')?.getAttribute('data-position')).toBe(position);
      expect(host.textContent?.trim()).toBe('セクション');
    }
    const signatures = (html: string) => {
      const host = window.document.createElement('div'); host.innerHTML = html;
      return [...host.querySelectorAll('button')].map(button => ({
        text: button.textContent?.trim(), label: button.getAttribute('aria-label'),
        pressed: button.getAttribute('aria-pressed'), disabled: button.disabled,
        tone: button.getAttribute('data-tone'), icons: [...button.querySelectorAll('svg')].map(icon => icon.getAttribute('width')),
      }));
    };
    for (const tone of headerTones) for (const disabled of [false, true]) {
      for (const component of ['THeader', 'THeaderButtonGroup'] as const) for (const view of ['year', 'month', 'week'] as const) {
        const options = { component, tone, disabled, view };
        const astro = previews[headerPreviewKey(options)]!;
        expect(signatures(astro)).toEqual(signatures(renderToStaticMarkup(ReactHeaderPreview(options))));
      }
      for (const iconOnly of [false, true]) for (const selected of [undefined, false, true]) {
        const options = { component: 'THeaderButton' as const, tone, disabled, iconOnly, selected };
        expect(signatures(previews[headerPreviewKey(options)]!)).toEqual(signatures(renderToStaticMarkup(ReactHeaderPreview(options))));
      }
    }
  } finally { await window.happyDOM.close(); await rm(directory, { recursive: true, force: true }); }
});

// 日本語・記号・絵文字・空文字をURLに保持し、壊れた文字コードは復元しない。
test('ボタンの文言はStorybookのURLから元の文字列へ復元できる', () => {
  for (const text of ['操作', '候補を見る', '<img src=x> & :; /', '予定📅', '', '  ']) {
    const code = encodeStoryText(text, '操作');
    expect(code).toMatch(/^[a-zA-Z0-9_-]*$/);
    expect(savedStoryText(`?args=content:icon;textcode:${code}`)).toBe(text === '操作' ? undefined : text);
    if (text !== '操作') expect(decodeStoryText(code)).toBe(text);
  }
  for (const code of [undefined, 123, 'u-110000', 'u-61--62', '<script>']) expect(decodeStoryText(code)).toBeUndefined();
});

// 実Astroテンプレートに任意の文言・全アイコンを組み合わせ、表示形式、読み上げ名、HTML安全性、ID分離を確認する。
test('Astroのボタン見本は3表示形式と全アイコン・任意テキストに対応する', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-header-content-test-'));
  const window = new Window();
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document });
  try {
    const outputs = await Promise.all(['header', 'icon'].map(async kind => {
      const output = join(directory, `${kind}.json`);
      const script = kind === 'header' ? 'scripts/render-astro-header-previews.ts' : 'scripts/render-astro-previews.ts';
      const process = Bun.spawn(['bun', script, output], { cwd: new URL('../../', import.meta.url).pathname, stdout: 'ignore', stderr: 'pipe' });
      const error = await new Response(process.stderr).text();
      expect(await process.exited, error).toBe(0);
      return JSON.parse(await readFile(output, 'utf8'));
    }));
    const headers = outputs[0] as AstroHeaderPreviews;
    const icons = outputs[1] as AstroIconPreviews;
    const signature = (html: string) => {
      const host = document.createElement('div'); host.innerHTML = html;
      const button = host.querySelector('button')!;
      return { text: button.textContent?.trim(), label: button.getAttribute('aria-label'),
        iconOnly: button.hasAttribute('data-icon-only'), pressed: button.getAttribute('aria-pressed'), disabled: button.disabled,
        svg: [...button.querySelectorAll('svg')].map(svg => ({ width: svg.getAttribute('width'),
          shapes: [...svg.querySelectorAll('*')].map(node => [node.tagName, [...node.attributes].filter(a => a.name !== 'id')
            .map(a => [a.name, a.value.replace(/url\(#[^)]+\)/g, 'url(#id)')])]) })),
        injected: button.querySelectorAll('img,script').length };
    };
    for (const content of ['text', 'icon', 'icon-text'] as const) {
      for (const text of ['候補を見る', '<img src=x onerror="alert(1)"> & 📅', '', '  ']) {
        const options = { component: 'THeaderButton' as const, tone: 'blue' as const, disabled: true, selected: true, content, text, icon: 'moon' as const };
        const html = astroHeaderButtonPreviewHtml(headers, icons, options, 'header-example');
        expect(signature(html)).toEqual(signature(renderToStaticMarkup(ReactHeaderPreview(options))));
        expect(signature(html).injected).toBe(0);
        expect(signature(html).svg).toHaveLength(content === 'text' ? 0 : 1);
      }
    }
    for (const icon of iconNames) {
      const options = { component: 'THeaderButton' as const, tone: 'neutral' as const, disabled: false, content: 'icon' as const, text: '操作名', icon };
      expect(signature(astroHeaderButtonPreviewHtml(headers, icons, options, 'header-all-icons')))
        .toEqual(signature(renderToStaticMarkup(ReactHeaderPreview(options))));
    }
    const options = { component: 'THeaderButton' as const, tone: 'neutral' as const, disabled: false, content: 'icon' as const, icon: 'moon' as const };
    const host = document.createElement('div');
    host.innerHTML = astroHeaderButtonPreviewHtml(headers, icons, options, 'header-first') + astroHeaderButtonPreviewHtml(headers, icons, options, 'header-second');
    const ids = [...host.querySelectorAll('[id]')].map(node => node.id);
    expect(ids.length).toBeGreaterThan(0); expect(new Set(ids).size).toBe(ids.length);
    for (const svg of host.querySelectorAll('svg')) {
      for (const match of svg.innerHTML.matchAll(/url\(#([^)]+)\)/g)) expect(svg.querySelector(`[id="${match[1]}"]`)).not.toBeNull();
    }
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous); else Reflect.deleteProperty(globalThis, 'document');
    await window.happyDOM.close(); await rm(directory, { recursive: true, force: true });
  }
});
