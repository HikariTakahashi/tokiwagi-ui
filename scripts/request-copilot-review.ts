import { appendFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
import { copilotQuotaExceeded } from './copilot-quota';

type RequestAPI = {
  get: (path: string) => Promise<Response>;
  request: () => Promise<Response>;
  sleep: (milliseconds: number) => Promise<unknown>;
};

export async function requestCopilotReview(api: RequestAPI, expectedHead: string) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = await api.get('');
    if (!current.ok) throw new Error('PRの状態を取得できませんでした (HTTP ' + current.status + ')');
    const pr = await current.json() as { head: { sha: string }; state: string; draft: boolean };
    if (pr.head.sha !== expectedHead || pr.state !== 'open' || pr.draft) {
      return 'Copilotレビューを省略：対象の差分またはPRの状態が変わりました';
    }
    const reviews = [];
    for (let page = 1; ; page += 1) {
      const response = await api.get(`/reviews?per_page=100&page=${page}`);
      if (!response.ok) throw new Error('Copilotの利用枠通知を取得できませんでした (HTTP ' + response.status + ')');
      reviews.push(...await response.json() as Parameters<typeof copilotQuotaExceeded>[0]);
      if (!response.headers.get('link')?.includes('rel="next"')) break;
    }
    if (copilotQuotaExceeded(reviews)) return 'Copilotレビューを省略：利用上限に到達（今月の公式ボット通知を確認）';

    const response = await api.request();
    if (response.status === 201) return 'Copilotレビューを依頼しました';
    if (response.status === 409 && attempt < 5) {
      await api.sleep(10_000);
      continue;
    }
    const body = await response.json().catch(() => ({})) as { failure_reason?: string };
    const reason = typeof body.failure_reason === 'string' && /^[A-Z0-9_]+$/.test(body.failure_reason)
      ? ' / ' + body.failure_reason : '';
    throw new Error('Copilotレビューを依頼できませんでした (HTTP ' + response.status + reason + ')');
  }
  throw new Error('Copilotレビューの依頼回数を超過しました。');
}

if (import.meta.main) {
  const { GITHUB_API_URL, GITHUB_REPOSITORY, GITHUB_STEP_SUMMARY, PR_NUMBER, PR_HEAD_SHA, REVIEW_TOKEN } = process.env;
  if (!GITHUB_API_URL || !GITHUB_REPOSITORY || !GITHUB_STEP_SUMMARY || !REVIEW_TOKEN ||
    !PR_NUMBER || !/^[1-9]\d*$/.test(PR_NUMBER) || !PR_HEAD_SHA || !/^[0-9a-f]{40}$/.test(PR_HEAD_SHA)) {
    throw new Error('Copilotレビュー依頼に必要な情報を取得できませんでした。');
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + REVIEW_TOKEN,
    'X-GitHub-Api-Version': '2026-03-10',
  };
  const pull = GITHUB_API_URL + '/repos/' + GITHUB_REPOSITORY + '/pulls/' + PR_NUMBER;
  const summary = await requestCopilotReview({
    get: path => fetch(pull + path, { headers, signal: AbortSignal.timeout(15_000) }),
    request: () => fetch(pull + '/copilot-code-review', {
      method: 'POST', headers, body: JSON.stringify({ review_effort: 'lite' }), signal: AbortSignal.timeout(15_000),
    }),
    sleep: setTimeout,
  }, PR_HEAD_SHA);
  appendFileSync(GITHUB_STEP_SUMMARY, summary + '\n');
}
