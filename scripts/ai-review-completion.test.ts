import { expect, mock, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { needsCopilotForPull, restoreOpenPRs, restoreReviewStatus, reviewCompletion, testMergeCommit } from './ai-review-completion';

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
  body: '## Pull request overview\n\nCopilot reviewed 1 out of 1 changed file in this pull request and generated no new comments.',
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

test('Copilotの指摘ありと指摘なしは完了とし、同じ公式ボットの失敗通知は完了にしない', () => {
  const quotaFailure = {
    ...copilotReview,
    body: 'Copilot was unable to review this pull request because the user who requested the review has insufficient remaining quota. Try requesting a review at a lower effort level.',
  };
  const serviceFailure = { ...copilotReview, body: 'Copilot encountered an error and was unable to review this pull request.' };
  const withFindings = {
    ...copilotReview,
    body: '## Pull request overview\n\nCopilot reviewed 2 out of 2 changed files in this pull request and generated 3 comments.',
  };
  const codex = [codexSummary('completed')];
  expect(reviewCompletion(codex, [quotaFailure, serviceFailure], true).complete).toBe(false);
  expect(reviewCompletion(codex, [quotaFailure, withFindings], true).complete).toBe(true);
  expect(reviewCompletion(codex, [copilotReview], true).complete).toBe(true);
});

test('実際のCopilot v2形式は判定に関わらず完了とし、判定のない通知や偽の投稿は通さない', () => {
  const marker = '<!-- ccr-overview-v2 -->\n\n';
  const triedOnGitHub = marker + '### 🔵 Needs a closer look\n\n外部ワークフローの実行結果はGitHub上で確認。\n\n' +
    '**No open issues** 🎉\n\n<sub>Review effort: Lite</sub>';
  const codex = [codexSummary('completed')];
  for (const body of [
    triedOnGitHub,
    marker + '## Copilot review overview\r\n\r\n### 🟡 Changes recommended\r\n\r\nDetails',
    marker + '### 🟢 Approval recommended',
  ]) {
    expect(reviewCompletion(codex, [{ ...copilotReview, body }], true).complete).toBe(true);
  }
  expect(reviewCompletion(codex, [{ ...copilotReview, body: marker + 'Copilot was unable to review.' }], true).complete).toBe(false);
  expect(reviewCompletion(codex, [{ ...copilotReview, body: triedOnGitHub, user: { ...copilotBot, id: 1 } }], true).complete).toBe(false);
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

const originalMerge = 'c'.repeat(40);
const regeneratedMerge = 'd'.repeat(40);

function recoveryFixture() {
  const fixture = {
    mergeSha: originalMerge,
    comments: [codexSummary('completed')],
    reviews: [] as (typeof copilotReview)[],
    statuses: new Map([[originalMerge, ['success']]]),
    status: mock(async (sha: string, state: string, _description: string) => {
      fixture.statuses.set(sha, [state, ...fixture.statuses.get(sha) ?? []]);
    }),
    async get(path: string) {
      switch (path) {
        case '/pulls/129':
          return Response.json({
            number: 129, state: 'open', draft: false, mergeable: true,
            base: { ref: 'main', sha: commit }, head: { sha: nextCommit },
          });
        case '/git/ref/pull/129/merge':
          return Response.json({ object: { type: 'commit', sha: fixture.mergeSha } });
        case `/git/commits/${originalMerge}`:
        case `/git/commits/${regeneratedMerge}`:
          return Response.json({ parents: [{ sha: commit }, { sha: nextCommit }] });
        case '/issues/129/comments?per_page=100&page=1':
          return Response.json(fixture.comments);
        case '/pulls/129/reviews?per_page=100&page=1':
          return Response.json(fixture.reviews);
        case `/commits/${originalMerge}/statuses?per_page=100&page=1`:
        case `/commits/${regeneratedMerge}/statuses?per_page=100&page=1`:
          return Response.json(fixture.statuses.get(path.split('/')[2]!)?.map(state => ({
            context: 'tkw-ai-review-complete', state,
          })) ?? []);
        default:
          throw new Error(`Unexpected GitHub API request: ${path}`);
      }
    },
  };
  return fixture;
}

// ベースと先端を保ったままマージ用SHAを再生成すると、新しいSHAだけに成功を追加する。
test('再生成されたマージ用SHAにレビュー完了を一度だけ登録する', async () => {
  const fixture = recoveryFixture();
  const documentationOnly = async () => false;
  expect(await restoreReviewStatus(fixture, '129', documentationOnly)).toBeUndefined();
  fixture.mergeSha = regeneratedMerge;
  expect((await restoreReviewStatus(fixture, '129', documentationOnly))?.mergeCommit).toBe(regeneratedMerge);
  expect(await restoreReviewStatus(fixture, '129', documentationOnly)).toBeUndefined();
  expect(fixture.status.mock.calls).toEqual([[regeneratedMerge, 'success', 'Codex完了・Copilot対象外']]);
});

// 最新状態が待機や失敗なら、過去に成功があっても現在のレビュー完了を確認してから更新する。
test.each(['pending', 'failure'])('最新状態が %s のマージ用SHAはレビュー完了後に成功へ更新する', async state => {
  const fixture = recoveryFixture();
  fixture.statuses.set(originalMerge, [state, 'success']);
  fixture.comments = [codexSummary('running')];
  expect(await restoreReviewStatus(fixture, '129', () => false)).toBeUndefined();
  expect(fixture.status).not.toHaveBeenCalled();

  fixture.comments = [codexSummary('completed')];
  await restoreReviewStatus(fixture, '129', () => false);
  expect(await restoreReviewStatus(fixture, '129', () => false)).toBeUndefined();
  expect(fixture.status.mock.calls).toEqual([[originalMerge, 'success', 'Codex完了・Copilot対象外']]);
});

// 現在のPRでCodexが未完了、または必要なCopilotレビューが未提出なら成功を送らない。
test('同じPRの必要なレビューが完了するまで成功を登録しない', async () => {
  const fixture = recoveryFixture();
  fixture.mergeSha = regeneratedMerge;
  expect(await restoreReviewStatus(fixture, '129', () => true)).toBeUndefined();
  fixture.comments = [codexSummary('running')];
  fixture.reviews = [copilotReview];
  expect(await restoreReviewStatus(fixture, '129', () => true)).toBeUndefined();
  expect(fixture.status).not.toHaveBeenCalled();
  fixture.comments = [codexSummary('completed')];
  await restoreReviewStatus(fixture, '129', () => true);
  expect(fixture.status.mock.calls).toEqual([[regeneratedMerge, 'success', 'CodexとCopilotのレビュー完了']]);
});

// 判定に使用したrefが登録前に切り替わった場合は、次回の確認まで古いSHAへの登録を見送る。
test('確認中にマージ用refが変わった場合は古いSHAに書き込まない', async () => {
  const fixture = recoveryFixture();
  fixture.statuses.clear();
  const changeMergeRef = () => {
    fixture.mergeSha = regeneratedMerge;
    return false;
  };
  expect(await restoreReviewStatus(fixture, '129', changeMergeRef)).toBeUndefined();
  expect(fixture.status).not.toHaveBeenCalled();
});

// mainで分類が変わっていても指定されたベースの規則で判定し、判定スクリプトのないベースでは省略しない。
test('マージ用コミットのベースごとにCopilotの要否を判定する', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'tkw-copilot-base-'));
  const git = (...args: string[]) => execFileSync('git', [
    '-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false',
    '-c', 'core.hooksPath=/dev/null', ...args,
  ], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const saveCommit = (message: string) => {
    git('add', '-A');
    git('commit', '--allow-empty', '-m', message);
    return git('rev-parse', 'HEAD');
  };
  try {
    git('init', '--initial-branch=main');
    const withoutRules = saveCommit('initial');
    mkdirSync(join(cwd, 'scripts'));
    const currentRules = readFileSync(join(import.meta.dir, 'ci-changes.ts'), 'utf8');
    const changesPath = join(cwd, 'scripts', 'ci-changes.ts');
    writeFileSync(changesPath, currentRules.replace(
      'function checksFor(path: string): CheckId[] {',
      "function checksFor(path: string): CheckId[] {\n  if (path === 'review-probe.md') return [];",
    ));
    writeFileSync(join(cwd, 'scripts', 'copilot-review-changes.ts'),
      readFileSync(join(import.meta.dir, 'copilot-review-changes.ts'), 'utf8'));
    const oldBase = saveCommit('old rules');
    git('checkout', '-b', 'feature');
    writeFileSync(join(cwd, 'review-probe.md'), 'docs');
    const head = saveCommit('PR changes');
    git('checkout', 'main');
    writeFileSync(changesPath, currentRules);
    const newBase = saveCommit('new rules');

    const prAtBase = (sha: string) => ({ number: 129, base: { ref: 'main', sha }, head: { sha: head } });
    expect(await needsCopilotForPull(prAtBase(oldBase), cwd)).toBe(false);
    expect(await needsCopilotForPull(prAtBase(newBase), cwd)).toBe(true);
    expect(await needsCopilotForPull(prAtBase(withoutRules), cwd)).toBe(true);
    expect(git('rev-parse', 'HEAD')).toBe(newBase);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

// 先頭のPRがAPI応答を待っていても、空いた枠から後続のPRを処理する。並行実行は最大4件に抑える。
test('遅いPRを待つ間に空いた枠で後続のPRの確認を進める', async () => {
  const slowPR = Promise.withResolvers<void>();
  const otherPRs = Promise.withResolvers<void>();
  const firstFourStarted = Promise.withResolvers<void>();
  const fifthStarted = Promise.withResolvers<void>();
  const started: number[] = [];
  const finished: number[] = [];
  const get = async (path: string) => {
    if (path === '/pulls?state=open&base=main&per_page=100&page=1') {
      return Response.json([1, 2, 3, 4, 5, 6].map(number => ({ number, draft: number === 6 })));
    }
    const number = Number(path.match(/^\/pulls\/(\d+)$/)?.[1]);
    if (!number) throw new Error(`Unexpected GitHub API request: ${path}`);
    started.push(number);
    if (started.length === 4) firstFourStarted.resolve();
    if (number === 5) fifthStarted.resolve();
    await (number === 1 ? slowPR.promise : otherPRs.promise);
    finished.push(number);
    return Response.json({ state: 'open', draft: true });
  };
  const status = mock(async () => {});
  const run = restoreOpenPRs({ get, status }, '');
  try {
    await firstFourStarted.promise;
    expect(started).toEqual([1, 2, 3, 4]);
    otherPRs.resolve();
    await fifthStarted.promise;
    expect(finished).not.toContain(1);
  } finally {
    otherPRs.resolve();
    slowPR.resolve();
    await run;
  }
  expect(started).toEqual([1, 2, 3, 4, 5]);
  expect(status).not.toHaveBeenCalled();
});
