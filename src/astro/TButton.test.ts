import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { buttonTones } from '../lib/button';
import { buttonSizes } from '../lib/button-size';

plugin({ name: 'astro-button-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code, loader: 'js',
  }));
} });
const { TButton } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// 静的出力の8色・slot・標準form属性を確認し、装飾アイコンとその有無が正しく出力されることを検証する。
test('AstroのTButtonは状態とフォーム属性を静的HTMLに出力する', async () => {
  const window = new Window();
  try {
    for (const tone of buttonTones) {
      const html = await container.renderToString(TButton, {
        props: { tone, leadingIcon: 'moon', type: 'submit', disabled: true, form: 'editor',
          name: 'action', value: 'save', class: 'save', 'data-action': 'save', 'aria-describedby': 'hint' },
        slots: { default: '保存する &lt;img src=x&gt;' },
      });
      window.document.body.innerHTML = html;
      const button = window.document.querySelector('button')!;
      expect(button.getAttribute('data-tone')).toBe(tone);
      expect(button.type).toBe('submit');
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('form')).toBe('editor');
      expect(button.getAttribute('name')).toBe('action');
      expect(button.getAttribute('value')).toBe('save');
      expect(button.className).toBe('tkw-button save');
      expect(button.getAttribute('data-action')).toBe('save');
      expect(button.getAttribute('aria-describedby')).toBe('hint');
      expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(button.querySelector('svg')?.getAttribute('width')).toBe('32');
      expect(button.textContent).toContain('保存する <img src=x>');
      expect(button.querySelector('img')).toBeNull();
      expect(html).not.toMatch(/<script|astro-island/);
    }
    window.document.body.innerHTML = await container.renderToString(TButton);
    const button = window.document.querySelector('button')!;
    expect(button.type).toBe('button');
    expect(button.disabled).toBe(false);
    expect(button.querySelector('.tkw-button__icon')).toBeNull();
  } finally {
    await window.happyDOM.close();
  }
});

// 静的HTMLで全サイズ・全配置を検証し、同じ図柄の前後アイコンでもクリッピングIDが重ならない。
test('AstroのTButtonはサイズと前後アイコンを静的出力で連動させる', async () => {
  const window = new Window();
  try {
    for (const [index, size] of buttonSizes.entries()) {
      for (const placement of [0, 1, 2, 3]) {
        window.document.body.innerHTML = await container.renderToString(TButton, { props: {
          size, leadingIcon: placement & 1 ? 'moon' : undefined, trailingIcon: placement & 2 ? 'moon' : undefined,
        }, slots: { default: '<em>保存する</em>' } });
        const button = window.document.querySelector('button')!;
        expect(button.getAttribute('data-size')).toBe(size);
        expect(button.querySelector('em')?.textContent).toBe('保存する');
        expect(button.firstElementChild?.classList.contains('tkw-button__leading-icon')).toBe(Boolean(placement & 1));
        expect(button.lastElementChild?.classList.contains('tkw-button__trailing-icon')).toBe(Boolean(placement & 2));
        const icons = [...button.querySelectorAll('svg')];
        expect(icons.length).toBe(Number(Boolean(placement & 1)) + Number(Boolean(placement & 2)));
        for (const icon of icons) {
          expect(icon.getAttribute('width')).toBe(String([20, 24, 32][index]));
          expect(icon.getAttribute('aria-hidden')).toBe('true');
        }
        const ids = [...button.querySelectorAll('[id]')].map(node => node.id);
        expect(new Set(ids).size).toBe(icons.length);
        for (const node of button.querySelectorAll('[clip-path]')) {
          expect(ids).toContain(node.getAttribute('clip-path')!.slice(5, -1));
        }
      }
    }
  } finally { await window.happyDOM.close(); }
});
