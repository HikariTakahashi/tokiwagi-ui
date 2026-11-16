import { expect, test } from 'bun:test';
import { reviewCompletion, testMergeCommit } from './ai-review-completion';

const commit = 'a'.repeat(40);
const nextCommit = 'b'.repeat(40);
const codexBot = { type: 'Bot', id: 199175422, login: 'chatgpt-codex-connector[bot]' };
const copilotBot = { type: 'Bot', id: 175728472, login: 'copilot-pull-request-reviewer[bot]' };
const app = { id: 1144995 };

function codexSummary(status: string, commitSha: string | null = commit) {
  return {
    user: codexBot,
    performed_via_github_app: app,
    body: '<!-- codex-pull-request-review-summary -->\n' +
      '<!-- codex-review-state:v1 ' + JSON.stringify({
        code_review: { status, commit_sha: commitSha },
        security_review: { status: 'completed', commit_sha: commit },
      }) + ' -->',
  };
}

const copilotReview = {
  user: copilotBot,
  state: 'COMMENTED',
  submitted_at: '2026-11-16T00:00:00Z',
  commit_id: nextCommit,
  body: '## Pull request overview',
};

// 同じPRの完了記録を比較し、Approveがなくてもそれぞれのレビュー完了を認める。
test('Codexの完了とCopilotの提出をそれぞれ一回確認する', () => {
  expect(reviewCompletion([codexSummary('completed')], [copilotReview], true)).toEqual({
    codexCommit: commit,
    copilotCommit: nextCommit,
    copilotSkipped: false,
    complete: true,
  });
});

// 対象外をCopilot完了の代わりに認めるが、Codexの完了は必要とする。
test('Copilot対象外でもCodexが完了するまで満たさない', () => {
  expect(reviewCompletion([], [], false).complete).toBe(false);
  expect(reviewCompletion([codexSummary('completed')], [], false)).toEqual({
    codexCommit: commit,
    copilotCommit: undefined,
    copilotSkipped: true,
    complete: true,
  });
  expect(reviewCompletion([codexSummary('completed')], [], true).complete).toBe(false);
});

// 開始・失敗・履歴の欠落、セキュリティレビューだけの完了はコードレビューの完了にしない。
test('Codexが失敗・進行中・コミット不明の場合は完了にしない', () => {
  for (const evidence of [
    codexSummary('failed'), codexSummary('running'), codexSummary('completed', null),
    { ...codexSummary('completed'), body: '👍' },
    { ...codexSummary('completed'), body: '<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 {bad} -->' },
  ]) {
    expect(reviewCompletion([evidence], [copilotReview], true).complete).toBe(false);
  }
});

// 投稿者本人の文章や、Copilotのレビュー依頼・下書きは完了の証拠として受理しない。
test('発行元が違う記録と未提出のレビューでは通過しない', () => {
  expect(reviewCompletion([{ ...codexSummary('completed'), performed_via_github_app: { id: 1 } }], [copilotReview], true).complete).toBe(false);
  expect(reviewCompletion([{ ...codexSummary('completed'), user: { ...codexBot, id: 1 } }], [copilotReview], true).complete).toBe(false);
  for (const review of [
    { ...copilotReview, user: { ...copilotBot, id: 1 } },
    { ...copilotReview, state: 'PENDING' },
    { ...copilotReview, submitted_at: undefined },
    { ...copilotReview, commit_id: '' },
  ]) {
    expect(reviewCompletion([codexSummary('completed')], [review], true).complete).toBe(false);
  }
});

// 再実行でサマリーが更新されても、公式ボットの完了コメントまたは提出済みレビューから一回分を確認する。
test('Codexの指摘なしコメントと指摘付きレビューの完了記録を区別して拾う', () => {
  const clean = {
    user: codexBot,
    performed_via_github_app: app,
    body: "<!-- codex-review-receipt:v1 -->\n\nCodex Review: Didn't find any major issues. Swish!\n\n**Reviewed commit:** `" +
      commit.slice(0, 10) + "`",
  };
  const withFindings = {
    ...copilotReview,
    user: codexBot,
    commit_id: commit,
    body: '<!-- codex-review-receipt:v1 -->\n\n### 💡 Codex Review\n\n**Reviewed commit:** `' +
      commit.slice(0, 10) + '`',
  };
  expect(reviewCompletion([codexSummary('running', nextCommit), clean], [], false).codexCommit).toBe(commit.slice(0, 10));
  expect(reviewCompletion([codexSummary('running', nextCommit)], [withFindings], false).codexCommit).toBe(commit);
  expect(reviewCompletion([], [{ ...withFindings, commit_id: nextCommit }], false).complete).toBe(false);
});

test('PRの応答にmerge_commit_shaがなくても、現在のベースと先端に対応するマージ用コミットを使う', async () => {
  const mergeSha = 'c'.repeat(40);
  const pr = { base: { sha: commit }, head: { sha: nextCommit }, mergeable: true };
  const fixtures = {
    [`/git/ref/pull/119/merge`]: { object: { type: 'commit', sha: mergeSha } },
    [`/git/commits/${mergeSha}`]: { parents: [{ sha: commit }, { sha: nextCommit }] },
  };
  const github = async (path: string) => {
    if (!(path in fixtures)) throw new Error(`Unexpected GitHub API request: ${path}`);
    return Response.json(fixtures[path]!);
  };
  expect(await testMergeCommit('119', pr, github)).toBe(mergeSha);
  expect(await testMergeCommit('119', { ...pr, head: { sha: 'd'.repeat(40) } }, github)).toBeUndefined();
  expect(await testMergeCommit('119', { ...pr, base: { sha: 'd'.repeat(40) } }, github)).toBeUndefined();
  expect(await testMergeCommit('119', pr, async () => new Response(null, { status: 404 }))).toBeUndefined();
});
