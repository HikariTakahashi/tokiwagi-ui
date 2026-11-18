import { expect, mock, test } from 'bun:test';
import { requestCopilotReview } from './request-copilot-review';

const head = 'b'.repeat(40);
const quotaReview = {
  user: { type: 'Bot', id: 175728472, login: 'copilot-pull-request-reviewer[bot]' },
  state: 'COMMENTED', submitted_at: new Date().toISOString(), commit_id: head,
  body: 'Copilot was unable to review this pull request because the user who requested the review has insufficient remaining quota.',
};
function fixture(reviews: object[] = []) {
  return {
    get: mock(async (path: string) => path === ''
      ? Response.json({ head: { sha: head }, state: 'open', draft: false }) : Response.json(reviews)),
    request: mock(async () => new Response('', { status: 201 })),
    sleep: mock(async (_milliseconds: number) => {}),
  };
}

test('利用上限の通知を確認したらリクエストせず省略理由を返す', async () => {
  const api = fixture([quotaReview]);
  expect(await requestCopilotReview(api, head)).toContain('利用上限');
  expect(api.request).not.toHaveBeenCalled();
});

test('通知をページ末尾まで確認し前月の通知では依頼を続ける', async () => {
  const api = fixture();
  api.get.mockImplementation(async path => {
    if (!path) return Response.json({ head: { sha: head }, state: 'open', draft: false });
    if (path.endsWith('page=1')) return Response.json([], { headers: { link: '<next>; rel="next"' } });
    return Response.json([quotaReview]);
  });
  expect(await requestCopilotReview(api, head)).toContain('利用上限');
  expect(api.request).not.toHaveBeenCalled();
  const prior = new Date();
  prior.setUTCDate(1);
  prior.setUTCMonth(prior.getUTCMonth() - 1);
  const reset = fixture([{ ...quotaReview, submitted_at: prior.toISOString() }]);
  expect(await requestCopilotReview(reset, head)).toContain('依頼しました');
  expect(reset.request).toHaveBeenCalledTimes(1);
});

test('偽投稿と一般障害の通知では依頼を省略しない', async () => {
  for (const review of [
    { ...quotaReview, user: { ...quotaReview.user, id: 1 } },
    { ...quotaReview, body: 'Copilot encountered an error and was unable to review this pull request.' },
  ]) {
    const api = fixture([review]);
    expect(await requestCopilotReview(api, head)).toContain('依頼しました');
    expect(api.request).toHaveBeenCalledTimes(1);
  }
});

test('PRの状態変更と取得エラーでは新たな依頼を送らない', async () => {
  for (const pr of [
    { head: { sha: 'c'.repeat(40) }, state: 'open', draft: false },
    { head: { sha: head }, state: 'closed', draft: false },
    { head: { sha: head }, state: 'open', draft: true },
  ]) {
    const api = fixture();
    api.get.mockImplementation(async () => Response.json(pr));
    expect(await requestCopilotReview(api, head)).toContain('状態が変わりました');
    expect(api.request).not.toHaveBeenCalled();
  }
  const api = fixture();
  api.get.mockImplementation(async path => path ? new Response('', { status: 403 })
    : Response.json({ head: { sha: head }, state: 'open', draft: false }));
  await expect(requestCopilotReview(api, head)).rejects.toThrow('HTTP 403');
  expect(api.request).not.toHaveBeenCalled();
});

test('競合の待機中に利用枠不足通知が届いたら再リクエストを止める', async () => {
  const api = fixture();
  api.request.mockImplementation(async () => new Response('', { status: 409 }));
  api.sleep.mockImplementation(async () => {
    api.get.mockImplementation(async path => path ? Response.json([quotaReview])
      : Response.json({ head: { sha: head }, state: 'open', draft: false }));
  });
  expect(await requestCopilotReview(api, head)).toContain('利用上限');
  expect(api.request).toHaveBeenCalledTimes(1);
  expect(api.sleep).toHaveBeenCalledWith(10_000);
});

test('権限不足や不明な422、継続する競合はエラーを維持する', async () => {
  for (const status of [403, 422, 409]) {
    const api = fixture();
    api.request.mockImplementation(async () => Response.json({ failure_reason: 'NOT_ELIGIBLE' }, { status }));
    await expect(requestCopilotReview(api, head)).rejects.toThrow(`HTTP ${status}`);
    expect(api.request).toHaveBeenCalledTimes(status === 409 ? 6 : 1);
  }
});
