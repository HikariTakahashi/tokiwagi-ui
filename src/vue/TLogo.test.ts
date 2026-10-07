import { expect, test } from 'bun:test';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Window } from 'happy-dom';
import { TLogo, type TLogoProps, type LogoSize } from 'tokiwagi-ui/vue';
import { logoSizes } from '../lib/logo';
import { assertLogoHtml } from '../lib/logo-test-helpers';

const render = (props: TLogoProps = {}) => renderToString(createSSRApp({ render: () => h(TLogo, props) }));

// 公開入口から全サイズ・読み上げ状態をSSRし、原本と余白を確認する。
test('VueのTLogoは原本の配色と3サイズ・余白・代替テキストを維持する', async () => {
  assertLogoHtml(await render(), 32, false);
  for (const size of logoSizes) for (const decorative of [false, true])
    assertLogoHtml(await render({ size, decorative }), size, decorative);
});

// 許可されないサイズはJS利用時も拒否する。
test('VueのTLogoは非対応サイズを拒否する', async () => {
  for (const size of [16, 24, 48, 0, NaN])
    expect(await render({ size: size as LogoSize }).catch((error: Error) => error.message)).toContain('32/64/128px');
});

// Vueのclass形式を受け取り、fallthrough属性・イベント・slotは転送しない。
test('VueのTLogoは配置用classだけを受け取り、親リンクの操作名を保つ', async () => {
  const html = await renderToString(createSSRApp({ render: () => h('a', { href: '/', 'aria-label': 'Tokiwagi UI ホーム' }, [
    h(TLogo, { decorative: true, class: ['brand-logo', { selected: true }], color: 'red', width: 16, style: 'padding:0', tabindex: 0, src: 'bad.svg', alt: '上書き' }, { default: () => '挿入' }),
  ]) }));
  expect(html).toContain('class="brand-logo selected"');
  expect(html).toContain('aria-label="Tokiwagi UI ホーム"');
  const window = new Window();
  window.document.body.innerHTML = html;
  expect(window.document.querySelector('img')!.getAttribute('alt')).toBe('');
  expect(html).not.toMatch(/bad.svg|上書き|挿入|tabindex|color:red|padding:0/);
});
