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
test('AstroのTButton見本は実部品と同じ状態と32pxの装飾アイコンを表示する', async () => {
  const window = new Window();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document });
  try {
    const previews = { button: await container.renderToString(TButton, { props: { leadingIcon: 'save' } }) };
    const icons = {} as AstroIconPreviews;
    for (const name of ['save', 'moon', 'tool'] as const) {
      icons[name] = { 32: await container.renderToString(TIcon, { props: { name, size: 32 } }) } as AstroIconPreviews[typeof name];
    }
    for (const tone of buttonTones) {
      for (const disabled of [false, true]) {
        for (const leadingIcon of [undefined, 'save', 'moon', 'tool'] as const) {
          const direct = window.document.createElement('div');
          direct.innerHTML = await container.renderToString(TButton, {
            props: { tone, disabled, leadingIcon }, slots: { default: '保存 &lt;img src=x&gt; &amp; 日本語' },
          });
          const host = window.document.createElement('div');
          host.innerHTML = astroButtonPreviewHtml(previews, icons, {
            component: 'TButton', text: '保存 <img src=x> & 日本語', tone, disabled, leadingIcon,
          }, 'button-preview');
          const actual = host.querySelector('button')!;
          const expected = direct.querySelector('button')!;
          expect(actual.getAttribute('type')).toBe(expected.getAttribute('type'));
          expect(actual.getAttribute('data-tone')).toBe(expected.getAttribute('data-tone'));
          expect(actual.hasAttribute('disabled')).toBe(expected.hasAttribute('disabled'));
          expect(actual.querySelector('.tkw-button__label')?.textContent).toBe(
            expected.querySelector('.tkw-button__label')?.textContent,
          );
          expect(actual.querySelectorAll('svg').length).toBe(expected.querySelectorAll('svg').length);
          expect(actual.querySelector('img')).toBeNull();
          if (leadingIcon) {
            expect(actual.querySelector('svg')?.getAttribute('width')).toBe('32');
            expect(actual.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
            for (const part of actual.querySelectorAll('[clip-path]')) {
              const target = part.getAttribute('clip-path')!.slice(5, -1);
              expect(host.querySelector(`[id="${target}"]`)).not.toBeNull();
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
