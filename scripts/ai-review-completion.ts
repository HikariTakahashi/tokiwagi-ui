import { execFile } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { promisify } from 'node:util';
import { copilotQuotaExceeded } from './copilot-quota';

type GitHubUser = { id?: number; login?: string; type?: string };
type Comment = { user?: GitHubUser; performed_via_github_app?: { id?: number }; body?: string };
type Review = Comment & { state?: string; submitted_at?: string; commit_id?: string };
type Pull = { number: number; base: { ref: string; sha: string }; head: { sha: string }; draft: boolean; state: string };
type GetPath = (path: string) => Promise<Response>;
type MergePull = (number: string, head: string) => Promise<string>;

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
  const quotaExceeded = copilotRequired && !copilotCommit && copilotQuotaExceeded(posted);
  return {
    codexCommit,
    copilotCommit,
    copilotQuotaExceeded: quotaExceeded,
    copilotSkipped: !copilotRequired || quotaExceeded,
    complete: Boolean(codexCommit && (!copilotRequired || copilotCommit || quotaExceeded)),
  };
}

function githubReviewAPI() {
  const {
    GITHUB_API_URL, GITHUB_REPOSITORY, GITHUB_SERVER_URL, GITHUB_RUN_ID, GH_TOKEN,
  } = process.env;
  if (!GH_TOKEN || !GITHUB_API_URL || !GITHUB_REPOSITORY) {
    throw new Error('GitHub APIの認証またはリポジトリ情報を取得できませんでした。');
  }

  const repo = `${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${GH_TOKEN}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2026-03-10',
  };
  async function get(path: string) {
    const response = await fetch(repo + path, { headers, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      throw new Error(`${path} を取得できませんでした (HTTP ${response.status})`);
    }
    return response;
  }
  async function status(commit: string, state: 'pending' | 'success' | 'failure', description: string) {
    if (!GITHUB_SERVER_URL || !GITHUB_RUN_ID) throw new Error('GitHub Actionsの実行URLを取得できませんでした。');
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
  const merge: MergePull = async (number, head) => {
    const response = await fetch(`${repo}/pulls/${number}/merge`, {
      method: 'PUT',
      headers,
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({ sha: head, merge_method: 'merge' }),
    });
    if (!response.ok) throw new Error(`GitHubがPR #${number} のマージを拒否しました (HTTP ${response.status})`);
    const result = await response.json() as { merged?: boolean; sha?: string };
    if (result.merged !== true || !result.sha || !fullSha.test(result.sha)) {
      throw new Error(`PR #${number} のマージ結果を確認できませんでした。`);
    }
    return result.sha;
  };
  return { get, status, merge };
}

type ReviewAPI = Pick<ReturnType<typeof githubReviewAPI>, 'get' | 'status'>;

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
  if (pr.state === 'open' && !pr.draft && pr.base.ref === 'main' &&
      fullSha.test(pr.base.sha) && fullSha.test(pr.head.sha)) return pr;
}

function reviewEvidence(get: GetPath, pullNumber: string) {
  return Promise.all([
    all<Comment>(get, `/issues/${pullNumber}/comments`),
    all<Review>(get, `/pulls/${pullNumber}/reviews`),
  ]);
}

async function completedPullReviews(get: GetPath, pr: Pull, needsCopilot: (pr: Pull) => boolean | Promise<boolean>) {
  const [comments, reviews] = await reviewEvidence(get, String(pr.number));
  const result = reviewCompletion(comments, reviews, true);
  if (result.complete) return result;
  if (result.codexCommit && !await needsCopilot(pr)) return reviewCompletion(comments, reviews, false);
}

function samePullCommits(current: Pull | undefined, prior: Pull) {
  return current?.base.sha === prior.base.sha && current.head.sha === prior.head.sha;
}

function successDescription(result: ReturnType<typeof reviewCompletion>) {
  return result.copilotQuotaExceeded ? 'Codex完了・Copilot利用上限のため省略' :
    result.copilotSkipped ? 'Codex完了・Copilot対象外' : 'CodexとCopilotのレビュー完了';
}

function reviewSummary(result: ReturnType<typeof reviewCompletion>) {
  return [
    `- Codex ${result.codexCommit ? '完了 (' + result.codexCommit + ')' : '未完了'}`,
    `- Copilot ${result.copilotQuotaExceeded ? '利用上限のため省略' : result.copilotSkipped ? '対象外' : result.copilotCommit ? '完了 (' + result.copilotCommit + ')' : '未完了'}`,
  ];
}

async function checkPR({ get, status }: ReviewAPI, summaryPath: string) {
  const { PR_NUMBER, PR_BASE_SHA, PR_HEAD_SHA, COPILOT_REQUIRED } = process.env;
  if (!PR_NUMBER || !/^[1-9]\d*$/.test(PR_NUMBER) ||
      !PR_BASE_SHA || !fullSha.test(PR_BASE_SHA) || !PR_HEAD_SHA || !fullSha.test(PR_HEAD_SHA)) {
    throw new Error('対象PRの番号、ベースSHA、先端SHAを取得できませんでした。');
  }
  const currentPR = async () => {
    const pr = await openMainPull(get, PR_NUMBER);
    if (pr && pr.base.sha === PR_BASE_SHA && pr.head.sha === PR_HEAD_SHA) return pr;
  };

  const requireCopilot = COPILOT_REQUIRED !== 'false';
  let result = reviewCompletion([], [], requireCopilot);
  for (let attempt = 0; attempt <= 36; attempt += 1) {
    const pr = await currentPR();
    if (!pr) {
      appendFileSync(summaryPath, 'PRの差分または状態が変わりました。現在のPRの実行結果を確認してください。\n');
      return;
    }
    if (attempt === 0 && !await hasSuccessfulReviewStatus(get, PR_HEAD_SHA)) {
      await status(PR_HEAD_SHA, 'pending', 'CodexとCopilotのレビュー完了を確認中');
    }

    const [comments, reviews] = await reviewEvidence(get, PR_NUMBER);
    result = reviewCompletion(comments, reviews, requireCopilot);

    if (result.complete && await currentPR()) {
      if (!await hasSuccessfulReviewStatus(get, PR_HEAD_SHA)) {
        await status(PR_HEAD_SHA, 'success', successDescription(result));
      }
      break;
    }
    if (attempt === 36) {
      if (await currentPR() && !await hasSuccessfulReviewStatus(get, PR_HEAD_SHA)) {
        await status(PR_HEAD_SHA, 'failure', '制限時間内に必要なレビューの完了を確認できませんでした');
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
    ...(process.exitCode ? ['- このPRのレビュー完了を確認できませんでした。'] : []),
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
  expectedHead?: string,
) {
  const pr = await openMainPull(get, pullNumber);
  if (!pr || (expectedHead && pr.head.sha !== expectedHead)) return;

  const head = pr.head.sha;
  if (!expectedHead && await hasSuccessfulReviewStatus(get, head)) return;
  const result = await completedPullReviews(get, pr, needsCopilot);
  if (!result || !samePullCommits(await openMainPull(get, pullNumber), pr)) return;
  if (!await hasSuccessfulReviewStatus(get, head)) await status(head, 'success', successDescription(result));
  return { head, result };
}

// 同じHEADに別PRの成功があっても、このPR自身のレビュー完了が必要。
export async function mergeReviewedPull(
  { get, merge }: { get: GetPath; merge: MergePull },
  pullNumber: string,
  expectedHead: string,
  needsCopilot: (pr: Pull) => boolean | Promise<boolean> = needsCopilotForPull,
) {
  const pr = await openMainPull(get, pullNumber);
  if (!pr || pr.head.sha !== expectedHead) throw new Error('対象PRの状態または先端SHAが変わりました。');
  if (!await completedPullReviews(get, pr, needsCopilot)) throw new Error(`PR #${pullNumber} の必要なレビューが未完了です。`);
  if (!await hasSuccessfulReviewStatus(get, expectedHead)) throw new Error('先端SHAのAIレビュー完了ステータスが成功していません。');
  if (!samePullCommits(await openMainPull(get, pullNumber), pr)) {
    throw new Error('レビュー確認中にPRのベースまたは先端SHAが変わりました。');
  }
  return merge(pullNumber, expectedHead);
}

export async function needsCopilotForPull(pr: Pick<Pull, 'base' | 'head' | 'number'>, cwd = process.cwd()) {
  if (!fullSha.test(pr.base.sha) || !fullSha.test(pr.head.sha)) return true;
  const git = (args: string[]) => execFileAsync('git', args, { cwd, timeout: 30_000, encoding: 'utf8' });
  try {
    await git(['merge-base', pr.base.sha, pr.head.sha]);
  } catch {
    try {
      // 並列に取得するため、リモート追跡refやFETCH_HEADを更新せずにオブジェクトを取得する。
      await git([
        'fetch', '--no-tags', '--refmap=', '--no-write-fetch-head', '--no-auto-maintenance',
        'origin', pr.base.sha, `refs/pull/${pr.number}/head`,
      ]);
    } catch {
      // 別のPRの取得で履歴が揃っていれば、判定スクリプトから比較できる。
    }
  }

  const directory = await mkdtemp(join(tmpdir(), 'tkw-copilot-review-'));
  try {
    const eventPath = join(directory, 'event.json');
    const outputPath = join(directory, 'output');
    // PRのベースから、通常ジョブと同じ判定スクリプトを取得する。
    for (const path of ['scripts/ci-changes.ts', 'scripts/copilot-review-changes.ts']) {
      const { stdout } = await git(['show', `${pr.base.sha}:${path}`]);
      await writeFile(join(directory, basename(path)), stdout);
    }
    await writeFile(eventPath, JSON.stringify({ pull_request: pr }));
    await execFileAsync(process.execPath, ['--no-env-file', '--no-install', join(directory, 'copilot-review-changes.ts')], {
      cwd,
      timeout: 30_000,
      env: {
        PATH: process.env.PATH,
        GITHUB_EVENT_NAME: 'pull_request_target',
        GITHUB_EVENT_PATH: eventPath,
        GITHUB_OUTPUT: outputPath,
      },
    });
    return (await readFile(outputPath, 'utf8')).trim() !== 'review=false';
  } catch {
    // ベースのスクリプトまたは判定結果を取得できない場合はCopilotを必須にする。
    return true;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
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
          `## PR #${number} (${restored.head})`,
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
  const api = githubReviewAPI();
  if (process.argv.includes('--merge-reviewed')) {
    const { PR_NUMBER, PR_HEAD_SHA } = process.env;
    if (!PR_NUMBER || !/^[1-9]\d*$/.test(PR_NUMBER) || !PR_HEAD_SHA || !fullSha.test(PR_HEAD_SHA)) {
      throw new Error('対象PRの番号または先端SHAを取得できませんでした。');
    }
    const sha = await mergeReviewedPull(api, PR_NUMBER, PR_HEAD_SHA);
    const message = `PR #${PR_NUMBER} を \`${sha}\` としてマージしました。`;
    if (summaryPath) appendFileSync(summaryPath, `${message}\n`);
    else console.log(message);
  } else if (!summaryPath) {
    throw new Error('GitHub Actionsの実行概要の保存先を取得できませんでした。');
  } else if (process.argv.includes('--restore-head')) {
    const { GITHUB_REF_NAME, GITHUB_REPOSITORY_OWNER, GITHUB_SHA } = process.env;
    if (!GITHUB_REF_NAME || !GITHUB_REPOSITORY_OWNER || !GITHUB_SHA || !fullSha.test(GITHUB_SHA)) {
      throw new Error('手動実行のブランチまたは先端SHAを取得できませんでした。');
    }
    const head = encodeURIComponent(`${GITHUB_REPOSITORY_OWNER}:${GITHUB_REF_NAME}`);
    const prs = await all<Pick<Pull, 'number' | 'head' | 'draft'>>(api.get, `/pulls?state=open&base=main&head=${head}`);
    const [pr, other] = prs;
    if (!pr || other || pr.draft || pr.head.sha !== GITHUB_SHA) throw new Error('対象ブランチに対応するPRを一意に確認できませんでした。');
    const result = await restoreReviewStatus(api, String(pr.number), needsCopilotForPull, GITHUB_SHA);
    if (!result) throw new Error(`PR #${pr.number} のレビュー完了を確認できませんでした。`);
    appendFileSync(summaryPath, `PR #${pr.number} の先端 \`${GITHUB_SHA}\` にAIレビュー完了ステータスを確認しました。\n`);
  } else if (process.argv.includes('--restore')) {
    if (!await restoreOpenPRs(api, summaryPath)) process.exitCode = 1;
  } else {
    await checkPR(api, summaryPath);
  }
}
