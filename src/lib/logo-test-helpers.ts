import { expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import type { LogoSize } from './logo';

/** HTMLをDOMとして読み、実表示寸法と原本・代替テキストを各方式で照合する。 */
export function assertLogoHtml(html: string, size: LogoSize, decorative: boolean) {
  const window = new Window();
  window.document.body.innerHTML = html;
  const image = window.document.querySelector('img')!;
  const frame = window.document.querySelector('span')!;
  expect(image.alt).toBe(decorative ? '' : 'Tokiwagi UI');
  expect(image.getAttribute('width')).toBe(String(size));
  expect(image.getAttribute('height')).toBe(String(size));
  expect(image.style.width).toBe(`${size}px`);
  expect(image.style.height).toBe(`${size}px`);
  expect(frame.style.width).toBe(`${size}px`);
  expect(frame.style.height).toBe(`${size}px`);
  expect(frame.style.padding).toBe(`${size / 4}px`);
  expect(frame.style.boxSizing).toBe('content-box');
  expect(frame.style.backgroundColor).toBe('var(--tkw-color-neutral-0)');
  expect(decodeURIComponent(image.getAttribute('src')!.replace('data:image/svg+xml,', '')))
    .toBe(readFileSync(new URL('../../icons/logo/logo.svg', import.meta.url), 'utf8'));
  expect(window.document.querySelector('[tabindex], [id], a, button, svg')).toBeNull();
  return frame;
}
