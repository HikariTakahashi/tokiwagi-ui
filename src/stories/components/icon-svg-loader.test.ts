import { expect, spyOn, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createIconSvgLoader } from './icon-svg-loader';
import type { IconSearchEntry } from '../../lib/icon-assets';

const icon: IconSearchEntry = { name: 'bell', category: 'basic', href: '?path=/docs/icons-bell--docs', searchLabels: [] };
const svg = readFileSync(new URL('../../../icons/bell/bell.svg', import.meta.url), 'utf8');

// 同一原本への同時・再取得を一つにまとめ、別図柄は表示要求があった時だけ個別取得する。
test('要求されたSVGだけを取得し、同時取得と成功データを共有する', async () => {
  const request = spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(svg)).mockResolvedValueOnce(new Response(svg));
  try {
    const load = createIconSvgLoader();
    expect(request).not.toHaveBeenCalled();
    const pending = load(icon);
    expect(load(icon)).toBe(pending);
    expect(await pending).toBe(svg);
    expect(await load(icon)).toBe(svg);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenLastCalledWith('./icon-assets/bell/bell.svg');
    await load({ ...icon, name: 'moon' });
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenLastCalledWith('./icon-assets/moon/moon.svg');
  } finally { request.mockRestore(); }
});

// 通信失敗・HTTPエラー・HTMLへのフォールバックを保持せず、同じURLへの再試行で原本を復旧する。
test('SVGの読み込み失敗はキャッシュせず再試行できる', async () => {
  const request = spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new TypeError('通信失敗'))
    .mockResolvedValueOnce(new Response('一時エラー', { status: 503 }))
    .mockResolvedValueOnce(new Response('<!doctype html>'))
    .mockResolvedValueOnce(new Response(svg));
  try {
    const load = createIconSvgLoader();
    expect(await load(icon).catch(error => error)).toHaveProperty('message', '通信失敗');
    expect(await load(icon).catch(error => error)).toHaveProperty('message', 'SVGの読み込みに失敗しました: bell / 503');
    expect(await load(icon).catch(error => error)).toHaveProperty('message', '不正なSVGです: bell');
    expect(await load(icon)).toBe(svg);
    expect(request).toHaveBeenCalledTimes(4);
  } finally { request.mockRestore(); }
});
