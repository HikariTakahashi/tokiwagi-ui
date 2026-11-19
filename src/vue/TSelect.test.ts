import { expect, spyOn, test } from 'bun:test';
import { renderToString } from '@vue/server-renderer';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { TSelect, type SelectOption } from 'tokiwagi-ui/vue';

const options: SelectOption[] = [{ value: 'button', label: 'ボタン' }, { value: 'label', label: '<ラベル>' }, { value: 'card', label: 'カード', disabled: true }];

// v-modelと標準changeを両方通知し、hydrateと更新でラベル・説明・無効状態を失わない。
test('VueのTSelectはSSR後にv-modelと標準属性を更新できる', async () => {
  const browser = new Window();
  const value = ref('button'); const disabled = ref(false); const changes: string[] = [];
  const page = { render: () => h('div', [h(TSelect, {
    options, modelValue: value.value, 'onUpdate:modelValue': (next: string) => { value.value = next; },
    onChange: (event: Event) => changes.push((event.target as HTMLSelectElement).value),
    label: '見本', description: '説明', error: '必須です', required: true, disabled: disabled.value,
    form: 'editor', name: 'example', class: 'custom', 'aria-describedby': 'external',
  }), h(TSelect, { options, 'aria-label': '別の見本' })]) };
  const globals = new Map<string, PropertyDescriptor | undefined>();
  const warn = spyOn(console, 'warn').mockImplementation(() => {});
  const error = spyOn(console, 'error').mockImplementation(() => {});
  const app = createSSRApp(page);
  try {
    for (const [key, value] of Object.entries({ window: browser, document: browser.document, HTMLElement: browser.HTMLElement,
      Element: browser.Element, SVGElement: browser.SVGElement, Node: browser.Node })) {
      globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const host = document.createElement('div'); document.body.append(host);
    host.innerHTML = await renderToString(createSSRApp(page));
    const input = host.querySelector('select')!;
    const ids = [...host.querySelectorAll('[id]')].map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(input.value).toBe('button'); expect(host.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(`external ${input.id}-description ${input.id}-error`);
    expect(input.getAttribute('aria-invalid')).toBe('true'); expect(input.getAttribute('form')).toBe('editor');
    expect(input.classList.contains('custom')).toBe(true); expect(input.options[2]!.disabled).toBe(true);
    expect(input.options[1]!.textContent).toBe('<ラベル>');
    app.mount(host);
    try {
      expect(host.querySelector('select')).toBe(input);
      input.value = 'label'; input.dispatchEvent(new browser.Event('change', { bubbles: true }) as unknown as Event); await nextTick();
      expect(value.value).toBe('label'); expect(changes).toEqual(['label']);
      disabled.value = true; value.value = 'button'; await nextTick();
      expect(input.disabled).toBe(true); expect(input.value).toBe('button');
      expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
    } finally { app.unmount(); host.remove(); }
  } finally {
    warn.mockRestore(); error.mockRestore();
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    await browser.happyDOM.close();
  }
});

// defaultValueと未選択をSSRでも選択済み属性として出力し、必須の標準検証へ渡す。
test('VueのTSelectは未選択と初期選択をSSRに出力する', async () => {
  const browser = new Window();
  try {
    browser.document.body.innerHTML = await renderToString(createSSRApp({ render: () => h(TSelect, {
      options, placeholder: '選択してください', defaultValue: '', required: true, 'aria-label': '見本',
    }) }));
    const input = browser.document.querySelector('select')!;
    expect(input.value).toBe(''); expect(input.options[0]!.hasAttribute('selected')).toBe(true); expect(input.checkValidity()).toBe(false);
  } finally { await browser.happyDOM.close(); }
});
