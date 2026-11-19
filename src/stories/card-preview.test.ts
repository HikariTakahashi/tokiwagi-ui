import { afterAll, beforeAll, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Window } from 'happy-dom';
import { astroCardPreviewHtml, cardExampleDefaults, cardViews, type AstroCardPreviews } from './card-preview';

let window: Window;
let previews: AstroCardPreviews;
let previousDocument: PropertyDescriptor | undefined;
beforeAll(() => {
  const directory = mkdtempSync(join(tmpdir(), 'tkw-card-test-'));
  try {
    const output = join(directory, 'cards.json');
    const result = Bun.spawnSync([Bun.which('bun')!, 'scripts/render-astro-card-previews.ts', output], { cwd: new URL('../../', import.meta.url).pathname });
    if (result.exitCode !== 0) throw new Error(result.stderr.toString());
    previews = JSON.parse(readFileSync(output, 'utf8'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
  window = new Window(); previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document });
});
afterAll(async () => {
  if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else Reflect.deleteProperty(globalThis, 'document');
  await window.happyDOM.close();
});

// 実Astro出力を使い、複数見本のID参照と設定・空文字・HTML風文言の安全な反映を確認する。
test('AstroのTCard見本はIDを分離し、文言をHTMLとして解釈しない', () => {
  for (const view of cardViews) {
    const options = { component: 'TCard' as const, view, variant: 'subtle' as const, size: 'lg' as const, as: 'section' as const,
      ...cardExampleDefaults, title: '<img src=x> & 日本語', description: '', text: '<script>実行しない</script>', href: '/guide?name=日本語&view=card' };
    window.document.body.innerHTML = astroCardPreviewHtml(previews, options, 'first') + astroCardPreviewHtml(previews, options, 'second');
    const cards = [...window.document.body.querySelectorAll('.tkw-card')];
    expect(cards).toHaveLength(2);
    for (const [index, card] of cards.entries()) {
      expect(card.tagName).toBe('SECTION'); expect(card.getAttribute('data-variant')).toBe('subtle'); expect(card.getAttribute('data-size')).toBe('lg');
      const id = index === 0 ? 'first-title' : 'second-title';
      expect(card.getAttribute('aria-labelledby')).toBe(id);
      expect(card.querySelector('h3')?.id).toBe(id); expect(card.querySelector('h3')?.textContent).toBe(options.title);
      expect(card.querySelector('.tkw-card-description')?.textContent).toBe('');
      expect(card.querySelector('.tkw-card-example-copy')?.textContent).toBe(options.text);
      expect(card.querySelector('script, img')).toBeNull();
      expect(card.querySelector('a')?.getAttribute('href')).toBe(options.href);
      if (view === 'link') expect(card.querySelectorAll('a, button, input')).toHaveLength(1);
    }
  }
});
