import { appendFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';

type GitHubUser = { id?: number; login?: string; type?: string };
type Comment = { user?: GitHubUser; performed_via_github_app?: { id?: number }; body?: string };
type Review = Comment & { state?: string; submitted_at?: string; commit_id?: string };
type MergeablePull = { base: { sha: string }; head: { sha: string }; mergeable: boolean | null };
type GetPath = (path: string, allowNotFound?: boolean) => Promise<Response>;

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

async function checkPR() {
  const {
    GITHUB_API_URL, GITHUB_REPOSITORY, GITHUB_SERVER_URL, GITHUB_RUN_ID, GITHUB_STEP_SUMMARY,
    GH_TOKEN, PR_NUMBER, PR_HEAD_SHA, COPILOT_REQUIRED,
  } = process.env;
  if (!PR_NUMBER || !/^[1-9]\d*$/.test(PR_NUMBER) || !fullSha.test(PR_HEAD_SHA ?? '') || !GH_TOKEN ||
    !GITHUB_API_URL || !GITHUB_REPOSITORY || !GITHUB_SERVER_URL || !GITHUB_RUN_ID || !GITHUB_STEP_SUMMARY) {
    throw new Error('PRまたはGitHub Actionsの実行情報を取得できませんでした。');
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
  async function all<T>(path: string): Promise<T[]> {
    const result: T[] = [];
    for (let page = 1; ; page += 1) {
      const response = await get(`${path}?per_page=100&page=${page}`);
      result.push(...await response.json() as T[]);
      if (!response.headers.get('link')?.includes('rel="next"')) return result;
    }
  }
  async function status(commit: string, state: 'pending' | 'success' | 'failure', description: string) {
    const response = await fetch(`${repo}/statuses/${commit}`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        context: 'tkw-ai-review-complete',
        state,
        description,
        target_url: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
      }),
    });
    if (!response.ok) throw new Error(`レビュー完了状況を登録できませんでした (HTTP ${response.status})`);
  }

  const pull = `/pulls/${PR_NUMBER}`;
  const mergeCommitFor = (pr: MergeablePull) => testMergeCommit(PR_NUMBER, pr, get);
  async function currentPR() {
    const pr = await (await get(pull)).json() as MergeablePull & {
      base: { ref: string }; draft: boolean; state: string;
    };
    return pr.state === 'open' && !pr.draft && pr.base.ref === 'main' && pr.head.sha === PR_HEAD_SHA ? pr : undefined;
  }
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
      appendFileSync(GITHUB_STEP_SUMMARY, 'PRの差分または状態が変わりました。現在のPRの実行結果を確認してください。\n');
      return;
    }
    // ステータスはテスト用マージコミットへ付け、別のPRと共用される先端SHAには付けない。
    const mergeCommit = await mergeCommitFor(pr);
    if (mergeCommit && pendingCommit !== mergeCommit) {
      await status(mergeCommit, 'pending', 'CodexとCopilotのレビュー完了を確認中');
      pendingCommit = mergeCommit;
    }

    const [comments, reviews] = await Promise.all([
      all<Comment>(`/issues/${PR_NUMBER}/comments`),
      all<Review>(`${pull}/reviews`),
    ]);
    result = reviewCompletion(comments, reviews, requireCopilot);

    if (result.complete && mergeCommit && (await currentMergeCommit()) === mergeCommit) {
      await status(mergeCommit, 'success', result.copilotSkipped ? 'Codex完了・Copilot対象外' : 'CodexとCopilotのレビュー完了');
      break;
    }
    if (attempt === 36) {
      if (mergeCommit && (await currentMergeCommit()) === mergeCommit) {
        await status(mergeCommit, 'failure', '制限時間内に必要なレビューの完了を確認できませんでした');
      }
      process.exitCode = 1;
      break;
    }
    await setTimeout(15_000);
  }

  appendFileSync(GITHUB_STEP_SUMMARY, [
    '## AIレビュー完了',
    '',
    `- Codex ${result.codexCommit ? '完了 (' + result.codexCommit + ')' : '未完了'}`,
    `- Copilot ${result.copilotSkipped ? '対象外' : result.copilotCommit ? '完了 (' + result.copilotCommit + ')' : '未完了'}`,
    ...(process.exitCode ? ['- レビューまたはマージ用コミットを確認できませんでした。'] : []),
    '',
  ].join('\n'));
}

if (import.meta.main) await checkPR();
