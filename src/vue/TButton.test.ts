import { expect, spyOn, test } from 'bun:test';
import { renderToString } from '@vue/server-renderer';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { TButton, type TButtonProps } from 'tokiwagi-ui/vue';

// 保存ボタンのSSRをhydrateし、操作名とDOMを維持したままネイティブイベントや無効状態を更新できる。
test('VueのTButtonはSSR後に属性とクリックを正しいbuttonへ渡す', async () => {
  const browser = new Window();
  const disabled = ref(false);
  const clicked: (EventTarget | null)[] = [];
  const props: TButtonProps = {
    type: 'submit', tone: 'blue', leadingIcon: 'save', form: 'editor',
    class: ['save-action'], 'aria-describedby': 'hint',
    onClick: (event: MouseEvent) => clicked.push(event.currentTarget),
  };
  const page = { render: () => h(TButton, { ...props, disabled: disabled.value, 'data-action': 'save' }, () => '保存する') };
  const app = createSSRApp(page);
  const globals = new Map<string, PropertyDescriptor | undefined>();
  const warn = spyOn(console, 'warn').mockImplementation(() => {});
  const error = spyOn(console, 'error').mockImplementation(() => {});
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
    const button = host.querySelector('button')!;
    const icon = button.querySelector('svg');
    expect(button.textContent?.trim()).toBe('保存する');
    expect(button.type).toBe('submit');
    expect(button.getAttribute('form')).toBe('editor');
    expect(button.getAttribute('aria-describedby')).toBe('hint');
    expect(button.getAttribute('data-action')).toBe('save');
    expect(button.className).toBe('tkw-button save-action');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.getAttribute('width')).toBe('32');

    app.mount(host);
    try {
      expect(host.querySelector('button')).toBe(button);
      expect(button.querySelector('svg')).toBe(icon);
      button.click();
      expect(clicked).toEqual([button]);
      disabled.value = true;
      await nextTick();
      expect(button.disabled).toBe(true);
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    } finally {
      app.unmount();
    }
  } finally {
    warn.mockRestore();
    error.mockRestore();
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    await browser.happyDOM.close();
  }
});
