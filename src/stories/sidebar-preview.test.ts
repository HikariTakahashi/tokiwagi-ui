import { afterAll, beforeAll, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Window } from 'happy-dom';
import { updateAstroSidebarPreview, type AstroSidebarPreviews, type SidebarPreviewOptions } from './sidebar-preview';

let window: Window;
let previews: AstroSidebarPreviews;
beforeAll(() => {
  const directory = mkdtempSync(join(tmpdir(), 'tkw-sidebar-test-'));
  try {
    const output = join(directory, 'sidebars.json');
    const result = Bun.spawnSync([Bun.which('bun')!, 'scripts/render-astro-sidebar-previews.ts', output], { cwd: new URL('../../', import.meta.url).pathname });
    if (result.exitCode !== 0) throw new Error(result.stderr.toString());
    previews = JSON.parse(readFileSync(output, 'utf8'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
  window = new Window();
});
afterAll(async () => { await window.happyDOM.close(); });

// 全12テンプレートが実部品の構造を保持し、開閉変更では同じDOMに属性とCSS変数だけを反映する。
test('Astroのサイドバー見本は実出力を使い、独立開閉と寸法更新でDOMを維持する', () => {
  expect(Object.keys(previews)).toHaveLength(12);
  const host = window.document.createElement('div') as unknown as HTMLElement;
  const args: SidebarPreviewOptions = { component: 'TSidebarLayout', sidebarPart: true, framework: 'astro', view: 'both',
    side: 'left', open: true, leftOpen: true, rightOpen: true, width: 280, gap: 24, animationDuration: 200, as: 'aside' };
  updateAstroSidebarPreview(host, previews, args);
  const left = host.querySelector<HTMLElement>('[data-side="left"]')!;
  const right = host.querySelector<HTMLElement>('[data-side="right"]')!;
  for (const [leftOpen, rightOpen] of [[false, true], [true, false], [false, false], [true, true]]) {
    updateAstroSidebarPreview(host, previews, { ...args, leftOpen: leftOpen!, rightOpen: rightOpen!, width: 240, gap: 0, animationDuration: 0 });
    expect(host.querySelector('[data-side="left"]')).toBe(left); expect(host.querySelector('[data-side="right"]')).toBe(right);
    expect(left.hasAttribute('inert')).toBe(!leftOpen); expect(right.hasAttribute('inert')).toBe(!rightOpen);
    expect(right.style.getPropertyValue('--tkw-sidebar-width')).toBe('240px');
    expect(host.querySelector<HTMLElement>('.tkw-sidebar-layout')?.style.getPropertyValue('--tkw-sidebar-gap')).toBe('0px');
    expect(host.querySelector<HTMLElement>('.tkw-sidebar-layout')?.style.getPropertyValue('--tkw-sidebar-duration')).toBe('0ms');
  }
  updateAstroSidebarPreview(host, previews, { ...args, component: 'TSidebar', side: 'right', as: 'div', open: false });
  expect(host.querySelectorAll('.tkw-sidebar')).toHaveLength(1);
  expect(host.querySelector('.tkw-sidebar')?.tagName).toBe('DIV');
  expect(host.querySelector('.tkw-sidebar')?.getAttribute('data-open')).toBe('false');
  updateAstroSidebarPreview(host, previews, { ...args, component: 'TSidebarMain', as: 'main' });
  expect(host.querySelector('.tkw-sidebar-main')?.tagName).toBe('MAIN');
  expect(host.querySelector('script, astro-island')).toBeNull();
  expect(() => updateAstroSidebarPreview(host, {}, { ...args, view: 'right' })).toThrow('見本');
  for (const [key, html] of Object.entries(previews)) {
    host.innerHTML = html;
    const [view, sidebarAs, mainAs] = key.split(':');
    expect(host.querySelectorAll('.tkw-sidebar')).toHaveLength(view === 'both' ? 2 : 1);
    expect(host.querySelector('.tkw-sidebar')?.tagName.toLowerCase()).toBe(sidebarAs);
    expect(host.querySelector('.tkw-sidebar-main')?.tagName.toLowerCase()).toBe(mainAs);
    expect(host.querySelector('.tkw-sidebar-header')).not.toBeNull();
    expect(host.querySelector('.tkw-sidebar-body')).not.toBeNull();
    expect(host.querySelector('.tkw-sidebar-footer')).not.toBeNull();
  }
});
