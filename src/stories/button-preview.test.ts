import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { buttonTones } from '../lib/button';
import { astroButtonPreviewHtml } from './button-preview';
import type { AstroIconPreviews } from './components/astro-preview';

plugin({ name: 'astro-button-preview-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TButton, TIcon } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// Controlsによる状態とアイコンの変更を実Astro出力と照合し、日本語とHTML風入力を安全に表示する。
test('AstroのTButton見本は実部品と同じ状態とサイズ・前後アイコンを表示する', async () => {
  const window = new Window();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document });
  try {
    const previews = { button: await container.renderToString(TButton, { props: { leadingIcon: 'save', trailingIcon: 'save' } }) };
    const icons = {} as AstroIconPreviews;
    for (const name of ['save', 'moon', 'tool'] as const) {
      icons[name] = {} as AstroIconPreviews[typeof name];
      for (const size of [20, 24, 32] as const) {
        icons[name][size] = await container.renderToString(TIcon, { props: { name, size } });
      }
    }
    for (const tone of buttonTones) {
      for (const disabled of [false, true]) {
        for (const [size, iconSize] of [['sm', 20], ['md', 24], ['lg', 32]] as const) {
          for (const [leadingIcon, trailingIcon] of [[undefined, undefined], ['moon', undefined], [undefined, 'tool'], ['moon', 'moon']] as const) {
            const direct = window.document.createElement('div');
            direct.innerHTML = await container.renderToString(TButton, {
              props: { tone, disabled, size, leadingIcon, trailingIcon }, slots: { default: '保存 &lt;img src=x&gt; &amp; 日本語' },
            });
            const host = window.document.createElement('div');
            host.innerHTML = astroButtonPreviewHtml(previews, icons, {
              component: 'TButton', text: '保存 <img src=x> & 日本語', tone, disabled, size, leadingIcon, trailingIcon,
            }, 'button-preview');
            const actual = host.querySelector('button')!;
            const expected = direct.querySelector('button')!;
            expect(actual.getAttribute('type')).toBe(expected.getAttribute('type'));
            expect(actual.getAttribute('data-tone')).toBe(expected.getAttribute('data-tone'));
            expect(actual.getAttribute('data-size')).toBe(expected.getAttribute('data-size'));
            expect(actual.hasAttribute('disabled')).toBe(expected.hasAttribute('disabled'));
            expect(actual.querySelector('.tkw-button__label')?.textContent).toBe(
              expected.querySelector('.tkw-button__label')?.textContent,
            );
            expect(actual.querySelectorAll('svg').length).toBe(expected.querySelectorAll('svg').length);
            expect(actual.querySelector('img')).toBeNull();
            const ids = [...actual.querySelectorAll('[id]')].map(node => node.id);
            expect(new Set(ids).size).toBe(ids.length);
            for (const icon of actual.querySelectorAll('svg')) {
              expect(icon.getAttribute('width')).toBe(String(iconSize));
              expect(icon.getAttribute('aria-hidden')).toBe('true');
            }
            for (const side of ['leading', 'trailing']) {
              expect(actual.querySelector(`.tkw-button__${side}-icon`) !== null).toBe(
                expected.querySelector(`.tkw-button__${side}-icon`) !== null,
              );
            }
            if (leadingIcon || trailingIcon) {
              for (const part of actual.querySelectorAll('[clip-path]')) {
                const target = part.getAttribute('clip-path')!.slice(5, -1);
                expect(host.querySelector(`[id="${target}"]`)).not.toBeNull();
              }
            }
          }
        }
      }
    }
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    else Reflect.deleteProperty(globalThis, 'document');
    await window.happyDOM.close();
  }
});
