import { expect, spyOn, test } from 'bun:test';
import { zipSync } from 'fflate';
import { reportExpiry, transferReport } from './visual-transfer';
import { repository, retentionMs, sha256, storageRepository } from './visual-storage';

// 期限は元の成果物の作成時刻を引き継ぎ、転送・再転送で7日間を延長しない。
test('転送レポートは作成から7日経過した時点で対象外になる', () => {
  const created = Date.parse('2026-10-30T00:00:00Z');
  const artifact = { id: 1, name: 'visual-report-1-1', created_at: new Date(created).toISOString(), expires_at: new Date(created + retentionMs).toISOString(), expired: false };
  expect(reportExpiry(artifact, created + retentionMs - 1)).toBe(artifact.expires_at);
  expect(reportExpiry(artifact, created + retentionMs)).toBeUndefined();
  expect(reportExpiry(artifact, created - 1)).toBeUndefined();
  expect(reportExpiry({ ...artifact, expired: true }, created)).toBeUndefined();
});

// 元リポジトリの読み取りトークンと、保管先だけを書けるトークンを使い分ける。
test('完了した画像比較のZIPを保管先へ転送し保存後に公開更新を通知する', async () => {
  const previous = { gh: process.env.GH_TOKEN, storage: process.env.VISUAL_STORAGE_TOKEN };
  process.env.GH_TOKEN = 'source-read-token';
  process.env.VISUAL_STORAGE_TOKEN = 'storage-write-token';
  const bytes = zipSync({ 'index.html': new TextEncoder().encode('report') });
  const methods: string[] = [];
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    const storage = url.includes(storageRepository);
    expect(new Headers(init?.headers).get('Authorization')).toBe(`Bearer ${storage ? 'storage-write-token' : 'source-read-token'}`);
    methods.push(method);
    if (url.endsWith('/actions/runs/123')) return Response.json({ id: 123, run_attempt: 2, path: '.github/workflows/visual.yml', status: 'completed', head_sha: 'a'.repeat(40), head_branch: 'test/32', repository: { full_name: repository }, head_repository: { full_name: repository } });
    if (url.includes('/actions/runs/123/artifacts?')) return Response.json({ artifacts: [{ id: 3, name: 'visual-report-123-2', expired: false, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + retentionMs).toISOString() }] });
    if (url.endsWith('/actions/artifacts/3/zip')) return new Response(bytes);
    if (url.includes('/releases/tags/')) return new Response('', { status: 404 });
    if (url.endsWith('/releases') && method === 'POST') {
      expect(JSON.parse(String(init?.body)).draft).toBe(true);
      return Response.json({ id: 77, assets: [] });
    }
    if (url.startsWith('https://uploads.github.com/')) return Response.json({ id: 88, name: 'report.zip' });
    if (url.endsWith('/releases/77') && method === 'PATCH') {
      const update = JSON.parse(String(init?.body));
      const metadata = JSON.parse(update.body);
      expect(update.draft).toBe(false);
      expect(metadata.sha256).toBe(sha256(bytes));
      expect(metadata.assetId).toBe(88);
      expect(metadata.sourceRepository).toBe(repository);
      return Response.json({ id: 77 });
    }
    if (url.endsWith('/dispatches')) return new Response(null, { status: 204 });
    throw new Error(`想定外の通信: ${url}`);
  }, { preconnect: fetch.preconnect }));
  try {
    await transferReport('123');
    expect(methods).toEqual(['GET', 'GET', 'GET', 'GET', 'POST', 'POST', 'PATCH', 'POST']);
  } finally {
    fetchMock.mockRestore();
    if (previous.gh === undefined) delete process.env.GH_TOKEN; else process.env.GH_TOKEN = previous.gh;
    if (previous.storage === undefined) delete process.env.VISUAL_STORAGE_TOKEN; else process.env.VISUAL_STORAGE_TOKEN = previous.storage;
  }
});

// 手動入力の実行IDから別のワークフローの成果物を公開しない。
test('画像比較以外のワークフローは保管先へ転送しない', async () => {
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async () => Response.json({
    path: '.github/workflows/ci.yml', status: 'completed', repository: { full_name: repository },
  }), { preconnect: fetch.preconnect }));
  try {
    const error = await transferReport('123').then(() => undefined, error => error);
    expect(String(error)).toContain('Visual Testsに限定');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  } finally { fetchMock.mockRestore(); }
});
