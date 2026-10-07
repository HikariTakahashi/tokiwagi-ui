import { expect, test } from 'bun:test';
import { renderToString } from 'react-dom/server';
import { TBrand, type TBrandProps, type LogoSize } from 'tokiwagi-ui/react';
import { logoSizes } from '../lib/logo';
import { assertBrandHtml } from '../lib/brand-test-helpers';

// 公開入口をSSRし、既定値・全サイズで装飾ロゴと一つの名称、余白と配置を維持する。
test('ReactのTBrandは既定32pxと全サイズで原本・名称・余白を維持する', () => {
  assertBrandHtml(renderToString(<TBrand />), 32);
  for (const size of logoSizes) assertBrandHtml(renderToString(<TBrand size={size} />), size);
});

// 型を迂回した不正値もTLogoの検証で拒否し、最小32pxを守る。
test('ReactのTBrandは非対応サイズと不正な型を拒否する', () => {
  for (const size of [16, 24, 48, 0, -32, Infinity, NaN, '32', null])
    expect(() => renderToString(<TBrand size={size as LogoSize} />)).toThrow('32/64/128px');
});

// 配置用classだけを外側へ渡し、追加属性やchildrenから静的な名前・表示を変更できない。
test('ReactのTBrandは外側のclassNameだけを転送する', () => {
  const extra = { name: '別名称', decorative: false, style: { padding: 0 }, tabIndex: 0,
    role: 'button', 'aria-label': '上書き', href: '/', title: '追加', onClick: () => {}, children: '挿入' };
  const html = renderToString(<TBrand {...extra as TBrandProps} className="brand" />);
  assertBrandHtml(html, 32, 'brand');
  expect(html).not.toMatch(/別名称|上書き|追加|挿入|tabindex|href=|role=/);
});

// 名称付きの親リンクで包んだSSR出力でも、操作対象は親の一つのaだけになる。
test('ReactのTBrandを包む親ホームリンクがリンク先と操作名を担う', () => {
  const html = renderToString(<a href="/" aria-label="Tokiwagi UI ホーム"><TBrand /></a>);
  expect(html).toContain('aria-label="Tokiwagi UI ホーム"');
  expect(html.match(/<a /g)).toHaveLength(1);
  expect(html).toContain('alt=""');
  expect(html).not.toContain('tabindex');
});
