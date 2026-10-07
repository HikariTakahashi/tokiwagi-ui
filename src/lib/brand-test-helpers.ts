import { expect } from 'bun:test';
import { Window, type HTMLElement as HappyHTMLElement } from 'happy-dom';
import { readFileSync } from 'node:fs';
import type { LogoSize } from './logo';

/** 各方式の実HTMLから、名称の単一読み上げ・元画像・余白・操作要素の分離を検査する。 */
export function assertBrandHtml(html: string, size: LogoSize, className?: string) {
  const window = new Window();
  try {
    window.document.body.innerHTML = html;
    const brand = window.document.body.firstElementChild as HappyHTMLElement;
    expect(brand.tagName).toBe('SPAN');
    expect(brand.textContent!.trim()).toBe('Tokiwagi UI');
    expect(brand.children.length).toBe(2);
    const logo = brand.children[0] as HappyHTMLElement;
    const name = brand.children[1] as HappyHTMLElement;
    expect(name.textContent).toBe('Tokiwagi UI');
    expect(brand.querySelectorAll('img')).toHaveLength(1);
    const image = brand.querySelector('img')!;
    expect(image.alt).toBe('');
    expect(decodeURIComponent(image.getAttribute('src')!.replace('data:image/svg+xml,', '')))
      .toBe(readFileSync(new URL('../../icons/logo/logo.svg', import.meta.url), 'utf8'));
    expect(image.getAttribute('width')).toBe(String(size));
    expect(image.getAttribute('height')).toBe(String(size));
    expect(logo.style.width).toBe(`${size}px`);
    expect(logo.style.height).toBe(`${size}px`);
    expect(logo.style.padding).toBe(`${size / 4}px`);
    expect(logo.style.boxSizing).toBe('content-box');
    expect(logo.style.backgroundColor).toBe('var(--tkw-color-neutral-0)');
    expect(brand.style.display).toBe('inline-flex');
    expect(brand.style.alignItems).toBe('center');
    expect(brand.style.gap).toBe('8px');
    expect(brand.style.padding).toBe('');
    expect(name.style.fontSize).toBe('16px');
    expect(name.style.fontWeight).toBe('600');
    expect(brand.querySelector('[tabindex], a, button, [aria-label], [role], svg')).toBeNull();
    expect(brand.hasAttribute('tabindex')).toBe(false);
    expect(brand.hasAttribute('aria-label')).toBe(false);
    expect(brand.hasAttribute('role')).toBe(false);
    if (className) {
      expect(brand.className).toBe(className);
      expect(logo.className).toBe('');
      expect(name.className).toBe('');
    }
  } finally {
    window.close();
  }
}
