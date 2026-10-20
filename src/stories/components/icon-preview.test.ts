import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { type IconAsset } from '../../lib/icon-assets';
import { colorPairs, pairStyle } from './icon-colors';
import { renderIconPreview } from './icon-preview';

let window: Window;
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(() => {
  window = new Window();
  for (const [key, value] of Object.entries({ document: window.document, navigator: window.navigator, Event: window.Event })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

function asset(name: string): IconAsset {
  return { name, category: 'basic', searchLabels: [], href: `?path=/docs/icons-${name}--docs`,
    svg: readFileSync(new URL(`../../../icons/${name}/${name}.svg`, import.meta.url), 'utf8') };
}

// 全色の選択で4サイズすべての前景・背景と表示トークンが更新され、別の見本へ状態が漏れない。
test('色変更が4サイズとトークン表示に反映される', () => {
  const view = renderIconPreview(asset('bell'));
  const other = renderIconPreview(asset('bell'));
  const select = view.querySelector('select')!;
  expect(view.querySelector('h1')!.textContent).toBe('bell');
  expect(select.options).toHaveLength(colorPairs.length);
  expect([...view.querySelectorAll('svg')].map(svg => svg.getAttribute('width'))).toEqual(['16', '20', '24', '32']);
  for (const [index, pair] of colorPairs.entries()) {
    select.value = String(index);
    select.dispatchEvent(new Event('change'));
    for (const swatch of view.querySelectorAll<HTMLElement>('.tkw-icon-swatch')) {
      expect(swatch.style.color).toBe(pairStyle(index).color);
      expect(swatch.style.backgroundColor).toBe(pairStyle(index).backgroundColor);
    }
    expect([...view.querySelectorAll('.tkw-icon-token-note code')].map(node => node.textContent)).toEqual([pair.foreground, pair.background]);
  }
  expect(other.querySelector('select')!.value).toBe('0');
});

// 比較画面から正しい個別ルール・一覧・共通ルールへ移動でき、原本のダウンロード名を維持する。
test('関連資料と原本ダウンロードを参照できる', () => {
  const view = renderIconPreview(asset('bell'));
  expect([...view.querySelectorAll('nav a')].map(a => [a.getAttribute('href'), a.getAttribute('target')])).toEqual([
    ['./?path=/docs/icons-bell--docs', '_top'],
    ['./?path=/docs/アイコン-アイコン名および用途--docs', '_top'],
    ['./?path=/docs/icons-display--docs', '_top'],
  ]);
  const download = view.querySelector('a[download]')!;
  expect(download.getAttribute('href')).toBe('./icon-assets/bell/bell.svg');
  expect(download.getAttribute('download')).toBe('bell.svg');
});

// コピーの成功と拒否を再現し、公開名と結果の読み上げ通知を失わないことを確認する。
test('公開名コピーの成功と失敗を通知する', async () => {
  const write = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  try {
    const view = renderIconPreview(asset('bell'));
    const button = view.querySelector('button')!;
    button.click();
    await Promise.resolve();
    expect(write).toHaveBeenLastCalledWith('bell');
    expect(view.querySelector('[role="status"]')!.textContent).toBe('「bell」をコピーしました。');
    write.mockRejectedValue(new Error('拒否'));
    button.click();
    await Promise.resolve();
    expect(view.querySelector('[role="status"]')!.textContent).toBe('コピーできませんでした。公開名「bell」を選択してコピーしてください。');
    expect(view.querySelector('[role="status"]')!.getAttribute('aria-live')).toBe('polite');
  } finally { write.mockRestore(); }
});

// 複数回描画したmoon/toolの全サイズでIDの衝突を防ぎ、クリッピング参照と装飾属性を維持する。
test('複数の使用例でクリッピングIDが衝突しない', () => {
  const ids: string[] = [];
  for (const name of ['moon', 'tool', 'moon']) {
    const view = renderIconPreview(asset(name));
    for (const svg of view.querySelectorAll('svg')) {
      const localIds = [...svg.querySelectorAll('[id]')].map(node => node.id);
      ids.push(...localIds);
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('focusable')).toBe('false');
      for (const match of svg.outerHTML.matchAll(/url\(#([^)]+)\)/g)) expect(localIds).toContain(match[1]!);
    }
  }
  expect(ids).toHaveLength(12);
  expect(new Set(ids).size).toBe(ids.length);
});
