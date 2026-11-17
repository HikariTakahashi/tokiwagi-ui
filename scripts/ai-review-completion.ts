import { execFile } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
import { promisify } from 'node:util';
import { changedPaths } from './ci-changes';
import { planCopilotReview } from './copilot-review-changes';

type GitHubUser = { id?: number; login?: string; type?: string };
type Comment = { user?: GitHubUser; performed_via_github_app?: { id?: number }; body?: string };
type Review = Comment & { state?: string; submitted_at?: string; commit_id?: string };
type MergeablePull = { base: { sha: string }; head: { sha: string }; mergeable: boolean | null };
type Pull = MergeablePull & { number: number; base: { ref: string }; draft: boolean; state: string };
type GetPath = (path: string, allowNotFound?: boolean) => Promise<Response>;

const statusContext = 'tkw-ai-review-complete';
const parallelPulls = 4;
const execFileAsync = promisify(execFile);
const codex = { id: 199175422, login: 'chatgpt-codex-connector[bot]' };
const copilot = { id: 175728472, login: 'copilot-pull-request-reviewer[bot]' };
const codexAppId = 1144995;
const fullSha = /^[0-9a-f]{40}$/;
const summaryMarker = '<!-- codex-pull-request-review-summary -->';
const receiptMarker = '<!-- codex-review-receipt:v1 -->';
const submitted = new Set(['COMMENTED', 'APPROVED', 'CHANGES_REQUESTED', 'DISMISSED']);

function fromBot(user: GitHubUser | undefined, bot: typeof codex) {
  return user?.type === 'Bot' && user.id === bot.id && user.login === bot.login;
}

function hasCopilotResult(review: Review) {
  // 利用枠不足・サービス障害でも同じボットのCOMMENTEDレビューが作られる。
  const body = review.body?.trimStart();
  if (!fromBot(review.user, copilot) || !body) return false;
  // 判定はすべてレビュー完了。承認の有無や指摘数をマージ条件にはしない。
  const overviewV2 = /^<!-- ccr-overview-v2 -->\s*(?:## Copilot review overview\s*)?### (?:🟢 Approval recommended|🟡 Changes recommended|🔵 Needs a closer look)[\t ]*(?:\r?\n|$)/;
  const legacyOverview = /^Copilot reviewed [1-9]\d* out of [1-9]\d* changed files? in this pull request and generated (?:\d+ (?:new )?comments?|no (?:new )?comments)\./m;
  return overviewV2.test(body) || legacyOverview.test(body);
}

function codexCommentCommit(comment: Comment) {
  if (!fromBot(comment.user, codex) || comment.performed_via_github_app?.id !== codexAppId || !comment.body) return;
  const body = comment.body.trimStart();

  if (body.startsWith(summaryMarker)) {
    const state = body.slice(summaryMarker.length).match(/^\s*<!-- codex-review-state:v1 ([^\r\n]+?) -->/);
    if (!state) return;
    try {
      const review = JSON.parse(state[1]!).code_review;
      if (review?.status === 'completed' && typeof review.commit_sha === 'string' && fullSha.test(review.commit_sha)) {
        return review.commit_sha as string;
      }
    } catch {
      // 認識できない形式を完了として扱わない。
    }
    return;
  }

  if (body.startsWith(receiptMarker)) {
    return body.slice(receiptMarker.length).match(
      /^\s*Codex Review: Didn't find any major issues\.[^\r\n]*\r?\n\s*\*\*Reviewed commit:\*\* `([0-9a-f]{10,40})`/,
    )?.[1];
  }
}

export function reviewCompletion(comments: readonly Comment[], reviews: readonly Review[], copilotRequired: boolean) {
  const posted = reviews.filter(review => review.state && submitted.has(review.state) &&
    review.submitted_at && review.commit_id && fullSha.test(review.commit_id));
  const codexCommit = comments.map(codexCommentCommit).find(Boolean) ??
    posted.find(review => {
      if (!fromBot(review.user, codex) || !review.body?.trimStart().startsWith(receiptMarker) ||
        !/^\s*### 💡 Codex Review\s*$/m.test(review.body)) return false;
      const reported = review.body.match(/^\*\*Reviewed commit:\*\* `([0-9a-f]{10,40})`\s*$/m)?.[1];
      return reported && review.commit_id?.startsWith(reported);
    })?.commit_id;
  const copilotCommit = copilotRequired ? posted.find(hasCopilotResult)?.commit_id : undefined;
  return {
    codexCommit,
    copilotCommit,
    copilotSkipped: !copilotRequired,
    complete: Boolean(codexCommit && (!copilotRequired || copilotCommit)),
  };
}

export async function testMergeCommit(pullNumber: string, pr: MergeablePull, get: GetPath) {
  if (pr.mergeable !== true) return;
  // API 2026-03-10にはPRのmerge_commit_shaがないため、GitHubのマージ用refを参照する。
  const refResponse = await get(`/git/ref/pull/${pullNumber}/merge`, true);
  if (refResponse.status === 404) return;
  const ref = await refResponse.json() as { object?: { type?: string; sha?: string } };
  const sha = ref.object?.sha;
  if (ref.object?.type !== 'commit' || !sha || !fullSha.test(sha)) return;

  // refが再計算の途中なら、現在のベースと先端が親になるまでステータスを書かない。
  const commitResponse = await get(`/git/commits/${sha}`, true);
  if (commitResponse.status === 404) return;
  const { parents } = await commitResponse.json() as { parents?: { sha: string }[] };
  if (parents?.length === 2 && parents[0]?.sha === pr.base.sha && parents[1]?.sha === pr.head.sha) return sha;
}

function githubReviewAPI() {
  const {
    GITHUB_API_URL, GITHUB_REPOSITORY, GITHUB_SERVER_URL, GITHUB_RUN_ID, GH_TOKEN,
  } = process.env;
  if (!GH_TOKEN || !GITHUB_API_URL || !GITHUB_REPOSITORY || !GITHUB_SERVER_URL || !GITHUB_RUN_ID) {
    throw new Error('GitHub Actionsの実行情報を取得できませんでした。');
  }

  const repo = `${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${GH_TOKEN}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2026-03-10',
  };
  async function get(path: string, allowNotFound = false) {
    const response = await fetch(repo + path, { headers, signal: AbortSignal.timeout(15_000) });
    if (!response.ok && !(allowNotFound && response.status === 404)) {
      throw new Error(`${path} を取得できませんでした (HTTP ${response.status})`);
    }
    return response;
  }
  async function status(commit: string, state: 'pending' | 'success' | 'failure', description: string) {
    const response = await fetch(`${repo}/statuses/${commit}`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        context: statusContext,
        state,
        description,
        target_url: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
      }),
    });
    if (!response.ok) throw new Error(`レビュー完了状況を登録できませんでした (HTTP ${response.status})`);
  }
  return { get, status };
}

type ReviewAPI = ReturnType<typeof githubReviewAPI>;

async function all<T>(get: GetPath, path: string): Promise<T[]> {
  const result: T[] = [];
  const separator = path.includes('?') ? '&' : '?';
  for (let page = 1; ; page += 1) {
    const response = await get(`${path}${separator}per_page=100&page=${page}`);
    result.push(...await response.json() as T[]);
    if (!response.headers.get('link')?.includes('rel="next"')) return result;
  }
}

async function openMainPull(get: GetPath, pullNumber: string) {
  const pr = await (await get(`/pulls/${pullNumber}`)).json() as Pull;
  if (pr.state === 'open' && !pr.draft && pr.base.ref === 'main') return pr;
}

function reviewEvidence(get: GetPath, pullNumber: string) {
  return Promise.all([
    all<Comment>(get, `/issues/${pullNumber}/comments`),
    all<Review>(get, `/pulls/${pullNumber}/reviews`),
  ]);
}

function successDescription(result: ReturnType<typeof reviewCompletion>) {
  return result.copilotSkipped ? 'Codex完了・Copilot対象外' : 'CodexとCopilotのレビュー完了';
}

function reviewSummary(result: ReturnType<typeof reviewCompletion>) {
  return [
    `- Codex ${result.codexCommit ? '完了 (' + result.codexCommit + ')' : '未完了'}`,
    `- Copilot ${result.copilotSkipped ? '対象外' : result.copilotCommit ? '完了 (' + result.copilotCommit + ')' : '未完了'}`,
  ];
}

async function checkPR({ get, status }: ReviewAPI, summaryPath: string) {
  const { PR_NUMBER, PR_HEAD_SHA, COPILOT_REQUIRED } = process.env;
  if (!PR_NUMBER || !/^[1-9]\d*$/.test(PR_NUMBER) || !fullSha.test(PR_HEAD_SHA ?? '')) {
    throw new Error('対象PRの番号または先端SHAを取得できませんでした。');
  }
  const currentPR = async () => {
    const pr = await openMainPull(get, PR_NUMBER);
    if (pr?.head.sha === PR_HEAD_SHA) return pr;
  };
  const mergeCommitFor = (pr: MergeablePull) => testMergeCommit(PR_NUMBER, pr, get);
  async function currentMergeCommit() {
    const pr = await currentPR();
    return pr && await mergeCommitFor(pr);
  }

  const requireCopilot = COPILOT_REQUIRED !== 'false';
  let result = reviewCompletion([], [], requireCopilot);
  let pendingCommit: string | undefined;
  for (let attempt = 0; attempt <= 36; attempt += 1) {
    const pr = await currentPR();
    if (!pr) {
      appendFileSync(summaryPath, 'PRの差分または状態が変わりました。現在のPRの実行結果を確認してください。\n');
      return;
    }
    // ステータスはテスト用マージコミットへ付け、別のPRと共用される先端SHAには付けない。
    const mergeCommit = await mergeCommitFor(pr);
    if (mergeCommit && pendingCommit !== mergeCommit) {
      if (!await hasSuccessfulReviewStatus(get, mergeCommit)) {
        await status(mergeCommit, 'pending', 'CodexとCopilotのレビュー完了を確認中');
      }
      pendingCommit = mergeCommit;
    }

    const [comments, reviews] = await reviewEvidence(get, PR_NUMBER);
    result = reviewCompletion(comments, reviews, requireCopilot);

    if (result.complete && mergeCommit && (await currentMergeCommit()) === mergeCommit) {
      await status(mergeCommit, 'success', successDescription(result));
      break;
    }
    if (attempt === 36) {
      if (mergeCommit && (await currentMergeCommit()) === mergeCommit) {
        if (await hasSuccessfulReviewStatus(get, mergeCommit)) {
          appendFileSync(summaryPath, '現在のマージ用コミットにはレビュー完了が登録済みです。\n');
          return;
        }
        await status(mergeCommit, 'failure', '制限時間内に必要なレビューの完了を確認できませんでした');
      }
      process.exitCode = 1;
      break;
    }
    await setTimeout(15_000);
  }

  appendFileSync(summaryPath, [
    '## AIレビュー完了',
    '',
    ...reviewSummary(result),
    ...(process.exitCode ? ['- レビューまたはマージ用コミットを確認できませんでした。'] : []),
    '',
  ].join('\n'));
}

async function hasSuccessfulReviewStatus(get: GetPath, commit: string) {
  const statuses = await all<{ context: string; state: string }>(get, `/commits/${commit}/statuses`);
  // APIは新しい順で返すため、このコンテキストの最初の状態を確認する。
  return statuses.find(status => status.context === statusContext)?.state === 'success';
}

export async function restoreReviewStatus(
  { get, status }: ReviewAPI,
  pullNumber: string,
  needsCopilot: (pr: Pull) => boolean | Promise<boolean>,
) {
  const pr = await openMainPull(get, pullNumber);
  if (!pr) return;

  const mergeCommit = await testMergeCommit(pullNumber, pr, get);
  if (!mergeCommit || await hasSuccessfulReviewStatus(get, mergeCommit)) return;

  const [comments, reviews] = await reviewEvidence(get, pullNumber);
  let result = reviewCompletion(comments, reviews, true);
  if (!result.codexCommit) return;
  if (!result.complete) {
    if (await needsCopilot(pr)) return;
    result = reviewCompletion(comments, reviews, false);
  }

  // 判定中に登録された成功を重複させず、現在のマージ用refにだけ書く。
  if (await hasSuccessfulReviewStatus(get, mergeCommit)) return;
  const latest = await openMainPull(get, pullNumber);
  if (!latest || await testMergeCommit(pullNumber, latest, get) !== mergeCommit) return;
  await status(mergeCommit, 'success', successDescription(result));
  return { mergeCommit, result };
}

async function needsCopilotForPull(pr: Pull) {
  const event = { pull_request: pr };
  let changes = changedPaths('pull_request', event, process.cwd());
  if (changes.forceReason) {
    try {
      // 並列に取得するため、リモート追跡refやFETCH_HEADを更新せずにオブジェクトを取得する。
      await execFileAsync('git', [
        'fetch', '--no-tags', '--refmap=', '--no-write-fetch-head', '--no-auto-maintenance',
        'origin', pr.base.sha, `refs/pull/${pr.number}/head`,
      ], { timeout: 30_000 });
    } catch {
      // 他のPRの取得で履歴が揃った可能性もあるため、再比較してCopilotの要否を決める。
    }
    changes = changedPaths('pull_request', event, process.cwd());
  }
  return planCopilotReview(changes.paths, changes.forceReason).run;
}

export async function restoreOpenPRs(api: ReviewAPI, summaryPath: string) {
  const prs = await all<Pick<Pull, 'number' | 'draft'>>(api.get, '/pulls?state=open&base=main');
  const openPRs = prs.filter(pr => !pr.draft);
  const queue = openPRs.values();
  let failed = false;

  async function restoreFromQueue() {
    for (const { number } of queue) {
      try {
        const restored = await restoreReviewStatus(api, String(number), needsCopilotForPull);
        if (!restored) continue;
        appendFileSync(summaryPath, [
          `## PR #${number} (${restored.mergeCommit})`,
          '',
          ...reviewSummary(restored.result),
          '',
          '',
        ].join('\n'));
      } catch (error) {
        console.error(`PR #${number} のレビュー完了状況を復元できませんでした。`, error);
        failed = true;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(parallelPulls, openPRs.length) }, restoreFromQueue));
  return !failed;
}

if (import.meta.main) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) throw new Error('GitHub Actionsの実行概要の保存先を取得できませんでした。');
  const api = githubReviewAPI();
  if (process.argv.includes('--restore')) {
    if (!await restoreOpenPRs(api, summaryPath)) process.exitCode = 1;
  } else {
    await checkPR(api, summaryPath);
  }
}
