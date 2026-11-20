import { expect, test } from 'bun:test';
import { plugin } from 'bun';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';

plugin({ name: 'astro-checkbox-test', setup(build) {
  build.onLoad({ filter: /\.astro$/ }, async args => ({
    contents: transform(await Bun.file(args.path).text(), {
      filename: args.path, internalURL: 'astro/compiler-runtime', resolvePath: specifier => specifier,
    }).code,
    loader: 'js',
  }));
} });
const { TCheckbox } = await import('tokiwagi-ui/astro');
const container = await experimental_AstroContainer.create();

// 複数配置のID、初期選択と一部選択の指定、フォームと説明の関連付けを実出力で検証する。
test('AstroのTCheckboxはネイティブ入力と一部選択の初期指定を出力する', async () => {
  const browser = new Window();
  try {
    const render = (checked?: boolean) => container.renderToString(TCheckbox, { props: {
      label: '<仕事>', description: '表示する項目', error: '確認してください',
      defaultChecked: true, checked, indeterminate: true, disabled: true, tone: 'teal',
      name: 'calendar', value: 'work', form: 'editor', class: 'custom', 'aria-describedby': 'external',
    } });
    browser.document.body.innerHTML = await render() + await render(false);
    const [first, second] = browser.document.querySelectorAll('input');
    expect(first!.id).not.toBe(second!.id);
    expect(first!.defaultChecked).toBe(true);
    expect(second!.defaultChecked).toBe(false);
    expect(first!.dataset.tkwCheckboxInitialMixed).toBe('true');
    expect(first!.dataset.tkwCheckboxMixed).toBe('true');
    expect(first!.type).toBe('checkbox');
    expect(first!.disabled).toBe(true);
    expect(first!.value).toBe('work');
    expect(first!.getAttribute('form')).toBe('editor');
    expect(first!.getAttribute('aria-invalid')).toBe('true');
    expect(first!.getAttribute('aria-describedby')).toBe(`external ${first!.id}-description ${first!.id}-error`);
    expect(first!.classList.contains('custom')).toBe(true);
    expect(first!.nextElementSibling!.getAttribute('data-tone')).toBe('teal');
    const label = browser.document.querySelector('label')!;
    expect(label.htmlFor).toBe(first!.id);
    expect(label.textContent).toContain('<仕事>');
  } finally {
    await browser.happyDOM.close();
  }
});
