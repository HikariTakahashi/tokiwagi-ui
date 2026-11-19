import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { selectSizes, selectTones } from '../lib/select';

plugin({ name: 'astro-select-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TSelect } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// 静的HTMLだけで選択・無効候補・説明・フォーム属性を提供し、複数配置のIDを分ける。
test('AstroのTSelectはフォームに必要な属性と選択済み候補を静的出力する', async () => {
  const browser = new Window();
  try {
    const render = () => container.renderToString(TSelect, { props: {
      options: [{ value: 'button', label: 'ボタン' }, { value: 'card', label: '<カード>', disabled: true }],
      placeholder: '選択してください', value: '', label: '見本', description: '説明', error: '必須です',
      required: true, name: 'example', form: 'editor', class: 'custom', 'data-example': 'colors', 'aria-describedby': 'external',
    } });
    const html = await render() + await render();
    browser.document.body.innerHTML = html;
    const ids = [...browser.document.querySelectorAll('[id]')].map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const input of browser.document.querySelectorAll('select')) {
      expect(input.value).toBe(''); expect(input.required).toBe(true); expect(input.checkValidity()).toBe(false);
      expect(input.name).toBe('example'); expect(input.getAttribute('form')).toBe('editor');
      expect(input.className).toBe('tkw-select__input custom'); expect(input.getAttribute('data-example')).toBe('colors');
      expect(input.getAttribute('aria-describedby')).toBe(`external ${input.id}-description ${input.id}-error`);
      expect(input.getAttribute('aria-invalid')).toBe('true'); expect(input.options[2]!.disabled).toBe(true);
      expect(input.options[2]!.textContent).toBe('<カード>'); expect(input.options[0]!.hasAttribute('selected')).toBe(true);
      expect(browser.document.querySelector(`label[for="${input.id}"]`)).not.toBeNull();
    }
    expect(html).not.toMatch(/<script|astro-island/);
  } finally { await browser.happyDOM.close(); }
});

// 全色・全サイズを公開入口で描画し、既定値と初期選択を標準属性で表す。
test('AstroのTSelectは全色とサイズの設定を描画する', async () => {
  const browser = new Window();
  try {
    for (const tone of selectTones) for (const size of selectSizes) {
      browser.document.body.innerHTML = await container.renderToString(TSelect, { props: {
        options: [{ value: 'button', label: 'ボタン' }, { value: 'card', label: 'カード' }],
        tone, size, defaultValue: 'card', disabled: true, 'aria-label': '見本',
      } });
      const input = browser.document.querySelector('select')!;
      expect(input.getAttribute('data-tone')).toBe(tone); expect(input.getAttribute('data-size')).toBe(size);
      expect(input.value).toBe('card'); expect(input.disabled).toBe(true);
      expect(browser.document.querySelector('svg')!.getAttribute('width')).toBe('16');
    }
  } finally { await browser.happyDOM.close(); }
});
