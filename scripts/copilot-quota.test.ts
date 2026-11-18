import { expect, test } from 'bun:test';
import { copilotQuotaExceeded } from './copilot-quota';

const now = new Date('2026-11-19T00:00:00Z');
const quotaReview = {
  user: { type: 'Bot', id: 175728472, login: 'copilot-pull-request-reviewer[bot]' },
  state: 'COMMENTED', submitted_at: '2026-11-16T00:00:00Z', commit_id: 'a'.repeat(40),
  body: 'Copilot was unable to review this pull request because the user who requested the review has insufficient remaining quota.',
};

test('実際の公式ボットの利用枠不足通知だけを認める', () => {
  expect(copilotQuotaExceeded([quotaReview], now)).toBe(true);
  expect(copilotQuotaExceeded([{ ...quotaReview, body: quotaReview.body + ' Try requesting a review at a lower effort level.' }], now)).toBe(true);
  for (const change of [
    { user: { ...quotaReview.user, id: 1 } }, { user: { ...quotaReview.user, login: 'someone' } },
    { user: { ...quotaReview.user, type: 'User' } }, { state: 'PENDING' }, { submitted_at: undefined },
    { commit_id: '' }, { submitted_at: 'invalid' }, { submitted_at: '2026-11-20T00:00:00Z' },
    { body: '> ' + quotaReview.body }, { body: 'Copilot encountered an error and was unable to review this pull request.' },
  ]) expect(copilotQuotaExceeded([{ ...quotaReview, ...change }], now)).toBe(false);
});

test('利用枠不足の扱いはUTCの月末で終了し同月でも別年の通知は使わない', () => {
  const review = { ...quotaReview, submitted_at: '2026-11-30T23:59:59Z' };
  expect(copilotQuotaExceeded([review], new Date('2026-11-30T23:59:59Z'))).toBe(true);
  expect(copilotQuotaExceeded([review], new Date('2026-12-01T00:00:00Z'))).toBe(false);
  expect(copilotQuotaExceeded([review], new Date('2027-11-30T23:59:59Z'))).toBe(false);
});
