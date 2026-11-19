import { expect, spyOn, test } from 'bun:test';
import { renderToString } from '@vue/server-renderer';
import { Window } from 'happy-dom';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { TButton, buttonSizes, type TButtonProps } from 'tokiwagi-ui/vue';

// 保存ボタンのSSRをhydrateし、操作名とDOMを維持したままネイティブイベントや無効状態を更新できる。
test('VueのTButtonはSSR後に属性とクリックを正しいbuttonへ渡す', async () => {
  const browser = new Window();
  const disabled = ref(false);
  const size = ref<'sm' | 'md' | 'lg'>('sm');
  const clicked: (EventTarget | null)[] = [];
  const props: TButtonProps = {
    type: 'submit', tone: 'blue', leadingIcon: 'save', trailingIcon: 'tool', form: 'editor',
    class: ['save-action'], 'aria-describedby': 'hint',
    onClick: (event: MouseEvent) => clicked.push(event.currentTarget),
  };
  const page = { render: () => h(TButton, { ...props, size: size.value, disabled: disabled.value, 'data-action': 'save' }, () => '保存する') };
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
    expect(icon?.getAttribute('width')).toBe('20');

    app.mount(host);
    try {
      expect(host.querySelector('button')).toBe(button);
      expect(button.querySelector('svg')).toBe(icon);
      button.click();
      expect(clicked).toEqual([button]);
      disabled.value = true;
      size.value = 'md';
      await nextTick();
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('data-size')).toBe('md');
      for (const icon of button.querySelectorAll('svg')) expect(icon.getAttribute('width')).toBe('24');
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

// SSRの全サイズ・全配置を同時に描画し、slotの保持、装飾属性、前後で同じ図柄のID分離を確認する。
test('VueのTButtonは3サイズと4通りのアイコン配置を同時に描画する', async () => {
  const browser = new Window();
  try {
    const page = { render: () => h('div', buttonSizes.flatMap(size => [0, 1, 2, 3].map(placement =>
      h(TButton, { size, leadingIcon: placement & 1 ? 'moon' : undefined, trailingIcon: placement & 2 ? 'moon' : undefined },
        () => h('em', '保存する'))))) };
    browser.document.body.innerHTML = await renderToString(createSSRApp(page));
    const ids = [...browser.document.querySelectorAll('[id]')].map(node => node.id);
    expect(new Set(ids).size).toBe(12);
    [...browser.document.querySelectorAll('button')].forEach((button, index) => {
      const placement = index % 4;
      expect(button.getAttribute('data-size')).toBe(buttonSizes[Math.floor(index / 4)]);
      expect(button.querySelector('em')?.textContent).toBe('保存する');
      expect(button.firstElementChild?.classList.contains('tkw-button__leading-icon')).toBe(Boolean(placement & 1));
      expect(button.lastElementChild?.classList.contains('tkw-button__trailing-icon')).toBe(Boolean(placement & 2));
      expect(button.querySelectorAll('svg').length).toBe(Number(Boolean(placement & 1)) + Number(Boolean(placement & 2)));
      for (const icon of button.querySelectorAll('svg')) {
        expect(icon.getAttribute('width')).toBe(String([20, 24, 32][Math.floor(index / 4)]));
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      }
    });
    for (const node of browser.document.querySelectorAll('[clip-path]')) {
      expect(ids).toContain(node.getAttribute('clip-path')!.slice(5, -1));
    }
  } finally { await browser.happyDOM.close(); }
});
