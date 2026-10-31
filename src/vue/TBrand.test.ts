import { expect, test } from 'bun:test';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TBrand, type TBrandProps, type LogoSize } from 'tokiwagi-ui/vue';
import { logoSizes } from '../lib/logo';
import { assertBrandHtml } from '../lib/brand-test-helpers';

const render = (props: TBrandProps = {}) => renderToString(createSSRApp({ render: () => h(TBrand, props) }));

// 公開入口をSSRし、全サイズでもTLogoの余白と単一の名称を維持する。
test('VueのTBrandは既定32pxと全サイズで原本・名称・余白を維持する', async () => {
  assertBrandHtml(await render(), 32);
  for (const size of logoSizes) assertBrandHtml(await render({ size }), size);
});

// JavaScript利用時の不正サイズもTLogoが拒否する。
test('VueのTBrandは非対応サイズを拒否する', async () => {
  for (const size of [16, 24, 48, 0, -32, Infinity, NaN])
    expect(await render({ size: size as LogoSize }).catch((error: Error) => error.message)).toContain('32/64/128px');
});

// Vueのclass形式を受け取り、fallthrough属性とslotから名称・操作性を変更できない。
test('VueのTBrandは外側のclassだけを転送し、追加属性とslotを無視する', async () => {
  const html = await renderToString(createSSRApp({ render: () => h(TBrand, {
    class: ['brand', { selected: true }], name: '別名称', decorative: false, style: 'padding:0',
    tabindex: 0, role: 'button', 'aria-label': '上書き', href: '/', title: '追加', onClick: () => {},
  }, { default: () => '挿入' }) }));
  assertBrandHtml(html, 32, 'brand selected');
  expect(html).not.toMatch(/別名称|上書き|追加|挿入|tabindex|href=|role=/);
});

// 任意の製品名やHTML風の文字列を各サイズで描画し、装飾ロゴとテキストだけになることを確認する。
test('VueのTBrandは指定テキストをHTMLとして解釈せず一度だけ表示する', async () => {
  for (const text of ['TokiWa Calendar', 'ときわカレンダー', '<img src=x onerror="alert(1)"> & $&']) {
    for (const size of logoSizes) {
      assertBrandHtml(await render({ text, size }), size, undefined, text);
    }
  }
});

// 名称が消えると空altのロゴだけになるため、空文字・空白だけの指定を拒否する。
test('VueのTBrandは空のテキストを拒否する', async () => {
  for (const text of ['', '  ', '\n\t']) {
    expect(await render({ text }).catch((error: Error) => error.message)).toContain('空白だけではない文字列');
  }
});
