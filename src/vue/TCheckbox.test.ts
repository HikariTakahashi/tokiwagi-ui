import { expect, spyOn, test } from 'bun:test';
import { renderToString } from '@vue/server-renderer';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { TCheckbox } from 'tokiwagi-ui/vue';

// SSR初期値と入力IDを維持し、v-modelとネイティブchangeを通知して非制御のリセットも保持する。
test('VueのTCheckboxはSSR後にv-model・一部選択・初期チェックを維持する', async () => {
  const browser = new Window();
  const globals = new Map<string, PropertyDescriptor | undefined>();
  const warning = spyOn(console, 'warn').mockImplementation(() => {});
  const model = ref(false);
  const mixed = ref(true);
  const changes: boolean[] = [];
  const page = { render: () => h('form', [
    h(TCheckbox, {
      label: 'すべて', description: '対象を表示', error: '選択してください',
      modelValue: model.value, indeterminate: mixed.value,
      'onUpdate:modelValue': (checked: boolean) => { model.value = checked; mixed.value = false; },
      onChange: (event: Event) => changes.push((event.target as HTMLInputElement).checked),
    }),
    h(TCheckbox, { label: '個人', name: 'calendar', value: 'personal', defaultChecked: true }),
  ]) };
  const app = createSSRApp(page);
  let mounted = false;
  try {
    for (const [key, value] of Object.entries({
      window: browser, document: browser.document, HTMLElement: browser.HTMLElement,
      Element: browser.Element, SVGElement: browser.SVGElement, Node: browser.Node,
    })) {
      globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const host = document.createElement('div');
    document.body.append(host);
    host.innerHTML = await renderToString(createSSRApp(page));
    const [parent, child] = host.querySelectorAll('input');
    expect(parent!.id).not.toBe(child!.id);
    expect(host.querySelector('label')!.htmlFor).toBe(parent!.id);
    expect(parent!.getAttribute('aria-describedby')).toBe(`${parent!.id}-description ${parent!.id}-error`);
    expect(parent!.getAttribute('aria-invalid')).toBe('true');
    expect(child!.defaultChecked).toBe(true);
    app.mount(host);
    mounted = true;

    expect(host.querySelector('input')).toBe(parent!);
    expect(parent!.indeterminate).toBe(true);
    parent!.click();
    await nextTick();
    expect(changes).toEqual([true]);
    expect(model.value).toBe(true);
    expect(parent!.checked).toBe(true);
    expect(parent!.indeterminate).toBe(false);
    child!.click();
    expect(child!.checked).toBe(false);
    host.querySelector('form')!.reset();
    expect(child!.checked).toBe(true);
    expect(warning).not.toHaveBeenCalled();
  } finally {
    if (mounted) app.unmount();
    warning.mockRestore();
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    await browser.happyDOM.close();
  }
});
