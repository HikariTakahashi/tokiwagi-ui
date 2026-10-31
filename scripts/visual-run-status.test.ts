import { expect, spyOn, test } from 'bun:test';
import { visualWasSkipped } from './visual-run-status';

const repository = 'HikariTakahashi/tokiwagi-ui';
const mockFetch = (handler: (...args: Parameters<typeof fetch>) => Promise<Response>) =>
  spyOn(globalThis, 'fetch').mockImplementation(Object.assign(handler, { preconnect: fetch.preconnect }));
const run = { path: '.github/workflows/visual.yml', status: 'completed', run_attempt: 3, repository: { full_name: repository } };

// 過去の成功や成果物の有無ではなく、最新試行の対象ジョブがskippedの場合だけ後続処理を止める。
test('最新試行で省略された画像比較だけを転送・コメントの対象外とする', async () => {
  for (const conclusion of ['skipped', 'success', 'failure', 'cancelled', null]) {
    const calls: string[] = [];
    const mock = mockFetch(async input => {
      const url = String(input); calls.push(url);
      if (url.endsWith('/actions/runs/123')) return Response.json(run);
      if (url.endsWith('/attempts/3/jobs?per_page=100&page=1')) return Response.json({ jobs: [{ name: 'tkw-visual', conclusion }] });
      throw new Error(`想定外の通信: ${url}`);
    });
    try {
      expect(await visualWasSkipped('123', repository)).toBe(conclusion === 'skipped');
      expect(calls).toHaveLength(2);
    } finally { mock.mockRestore(); }
  }
});

// ジョブ一覧の2ページ目も調べ、ジョブ欠落や撮影前の失敗を省略と誤認して通知を消さない。
test('ページをまたいで対象を探し欠落の場合は障害通知を維持する', async () => {
  for (const found of [true, false]) {
    const mock = mockFetch(async input => {
      const url = String(input);
      if (url.endsWith('/actions/runs/123')) return Response.json(run);
      if (url.endsWith('page=1')) return Response.json({ jobs: Array.from({ length: 100 }, () => ({ name: 'other', conclusion: 'success' })) });
      return Response.json({ jobs: found ? [{ name: 'tkw-visual', conclusion: 'skipped' }] : [] });
    });
    try { expect(await visualWasSkipped('123', repository)).toBe(found); }
    finally { mock.mockRestore(); }
  }
});

// 認証・API障害や別ワークフローを省略成功として扱わず、実行を失敗させて可視化する。
test('不正な対象と状態取得失敗をエラーとして報告する', async () => {
  for (const response of [new Response('', { status: 403 }), Response.json({ ...run, path: '.github/workflows/ci.yml' }), Response.json({ ...run, status: 'in_progress' })]) {
    const mock = mockFetch(async () => response);
    try { expect(await visualWasSkipped('123', repository).catch(error => error)).toBeInstanceOf(Error); }
    finally { mock.mockRestore(); }
  }
  expect(await visualWasSkipped('not-an-id', repository).catch(error => error)).toBeInstanceOf(Error);
  expect(await visualWasSkipped('123', 'someone/fork').catch(error => error)).toBeInstanceOf(Error);
});
