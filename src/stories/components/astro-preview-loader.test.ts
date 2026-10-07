import { expect, spyOn, test } from 'bun:test';
import { createAstroPreviewLoader } from './astro-preview-loader';

// 一時的なHTTP失敗を保持せず、再試行時に同じURLへ再取得して成功データを共有する。
test('HTTP失敗後に同じURLで再試行し、成功した見本だけをキャッシュする', async () => {
  const fetchPreview = spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response('一時エラー', { status: 503 }))
    .mockResolvedValueOnce(Response.json({ 32: '復旧したHTML' }));
  try {
    const load = createAstroPreviewLoader<Record<string, string>>('/assets/previews.json');
    const failure = await load().catch(error => error);
    expect(failure).toBeInstanceOf(Error);
    expect(failure.message).toContain('503');
    const pending = load();
    expect(load()).toBe(pending);
    expect(await pending).toEqual({ 32: '復旧したHTML' });
    expect(await load()).toEqual({ 32: '復旧したHTML' });
    expect(fetchPreview).toHaveBeenCalledTimes(2);
    expect(fetchPreview).toHaveBeenLastCalledWith('/assets/previews.json', { cache: 'no-store' });
  } finally { fetchPreview.mockRestore(); }
});

// 通信失敗とJSONの解析失敗も再試行でき、エラーを空のHTMLへ置き換えない。
test('通信またはJSON解析が失敗した場合も次の取得で復旧できる', async () => {
  const fetchPreview = spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new TypeError('通信失敗'))
    .mockResolvedValueOnce(new Response('JSONではない'))
    .mockResolvedValueOnce(Response.json('有効な見本'));
  try {
    const load = createAstroPreviewLoader<string>('/previews.json');
    expect(await load().catch(error => error)).toHaveProperty('message', '通信失敗');
    expect(await load().catch(error => error)).toBeInstanceOf(SyntaxError);
    expect(await load()).toBe('有効な見本');
    expect(fetchPreview).toHaveBeenCalledTimes(3);
  } finally { fetchPreview.mockRestore(); }
});
