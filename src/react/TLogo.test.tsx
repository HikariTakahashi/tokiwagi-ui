import { expect, test } from 'bun:test';
import { renderToString } from 'react-dom/server';
import { TLogo, type TLogoProps, type LogoSize } from 'tokiwagi-ui/react';
import { logoSizes } from '../lib/logo';
import { assertLogoHtml } from '../lib/logo-test-helpers';

// 公開入口から全サイズ・読み上げ状態をSSRし、原本と余白を確認する。
test('ReactのTLogoは原本の配色と3サイズ・余白・代替テキストを維持する', () => {
  assertLogoHtml(renderToString(<TLogo />), 32, false);
  for (const size of logoSizes) for (const decorative of [false, true])
    assertLogoHtml(renderToString(<TLogo size={size} decorative={decorative} />), size, decorative);
});

// JSX型を迂回した値も描画時に拒否し、32px未満への縮小を防ぐ。
test('ReactのTLogoは非対応サイズと不正なdecorativeを拒否する', () => {
  for (const size of [16, 24, 48, 0, NaN, '32', null])
    expect(() => renderToString(<TLogo size={size as LogoSize} />)).toThrow('32/64/128px');
  expect(() => renderToString(<TLogo decorative={'false' as unknown as boolean} />)).toThrow('boolean');
});

// classNameは外側に置き、追加属性・色・イベント・childrenで固定表示を上書きしない。
test('ReactのTLogoは配置用classNameだけを受け取り、親リンクの操作名を保つ', () => {
  const extra = { color: 'red', width: 16, style: { padding: 0 }, tabIndex: 0, src: 'bad.svg', alt: '上書き', onClick: () => {}, children: '挿入' };
  const html = renderToString(<a href="/" aria-label="Tokiwagi UI ホーム"><TLogo {...extra as TLogoProps} className="brand-logo" decorative /></a>);
  expect(html).toContain('aria-label="Tokiwagi UI ホーム"');
  expect(html).toContain('class="brand-logo"');
  expect(html).toContain('alt=""');
  expect(html).not.toMatch(/bad.svg|上書き|挿入|tabindex|color:red|padding:0/);
});
