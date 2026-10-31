import { allGithub, downloadGithub, github, repository, unpackArchive } from './visual-storage';
import { reportExpiry } from './visual-transfer';

const site = 'https://hikaritakahashi.github.io/tokiwagi-ui-visual-results';
type Summary = { schemaVersion: 1; passed: number; failed: number; skipped: number; preview: string };
type Artifact = Parameters<typeof reportExpiry>[0];
type Run = {
  id: number; run_attempt: number; path: string; event: string; status: string; head_sha: string;
  repository: { full_name: string }; head_repository: { full_name: string } | null;
};
type Pull = { number: number; state: string; base: { ref: string; repo: { full_name: string } }; head: { repo: { full_name: string } | null } };

// PR由来のJSONは文章やURLとして使わず、数値と既知の画像パスだけを受け付ける。
export function readCommentSummary(files: Record<string, Uint8Array>): Summary | undefined {
  const bytes = files['summary.json'];
  if (!bytes) return;
  if (bytes.length > 4096) throw new Error('コメント用の集計ファイルが大きすぎます');
  const value = JSON.parse(new TextDecoder().decode(bytes)) as Summary;
  if (value?.schemaVersion !== 1 || ![value.passed, value.failed, value.skipped].every(count => Number.isSafeInteger(count) && count >= 0 && count <= 10000) ||
    value.passed + value.failed + value.skipped === 0 || typeof value.preview !== 'string' ||
    (value.preview !== '' && (!/^gallery-images\/\d+\.png$/.test(value.preview) || !files[value.preview]))) {
    throw new Error('コメント用の集計ファイルが不正です');
  }
  return value;
}

export function commentBody(run: Pick<Run, 'id' | 'run_attempt' | 'head_sha'>, summary?: Summary, expiresAt?: string, published?: { gallery: string; image?: string }) {
  const expiry = expiresAt ? `${new Date(expiresAt).toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })} JST` : '保存ファイルなし';
  const counts = summary ? `成功：${summary.passed}件 ／ 失敗：${summary.failed}件` : '成功：取得できず ／ 失敗：取得できず';
  const link = published?.image
    ? `[![ここに確認用の画像を表示](${published.image})](${published.gallery})`
    : published ? `[画像一覧・差分を確認](${published.gallery})`
      : `[画像を公開できなかったため、Actionsの結果を確認](https://github.com/${repository}/actions/runs/${run.id}/attempts/${run.run_attempt})`;
  return `${summary ? '✅ ビジュアルテスト完了' : '⚠️ ビジュアルテストの結果を取得できませんでした'}  \n対象コミット：\`${run.head_sha.slice(0, 7)}\`  \n${counts}  \n保存期間：${expiry}\n\n${link}\n\n<!-- tkw-visual-result:${run.id}:${run.run_attempt} -->`;
}

// 専用URLの公開を待つ。公開サイトには認証トークンを送らない。
export async function waitForReport(gallery: string, image?: string, attempts = 24, pause = () => Bun.sleep(20000)) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const urls = image ? [gallery, image] : [gallery];
      const ready = await Promise.all(urls.map(async url => {
        const response = await fetch(url, { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(10000) });
        return response.ok && (url === image ? response.headers.get('content-type')?.startsWith('image/png') : response.headers.get('content-type')?.startsWith('text/html'));
      }));
      if (ready.every(Boolean)) return true;
    } catch { /* Pagesのデプロイ中は次の試行で再確認する。 */ }
    if (attempt + 1 < attempts) await pause();
  }
  return false;
}

export async function postVisualComment(runId: string, transferred = false) {
  if (!/^\d+$/.test(runId)) throw new Error('通知する実行IDは数値で指定してください');
  const run = await (await github(`/repos/${repository}/actions/runs/${runId}`)).json() as Run;
  if (run.path !== '.github/workflows/visual.yml' || run.status !== 'completed' || run.repository.full_name !== repository ||
    !/^[a-f0-9]{40}$/.test(run.head_sha) || !Number.isSafeInteger(run.id) || !Number.isSafeInteger(run.run_attempt)) {
    throw new Error('通知対象は元リポジトリの完了したVisual Testsに限定します');
  }
  // mainのpush・候補生成・forkの成果物をPRの比較結果として扱わない。
  if (run.event !== 'pull_request' || run.head_repository?.full_name !== repository) return;
  const pulls = (await allGithub<Pull>(`/repos/${repository}/commits/${run.head_sha}/pulls`, '')).filter(pull =>
    pull.state === 'open' && pull.base.ref === 'main' && pull.base.repo.full_name === repository && pull.head.repo?.full_name === repository);
  if (!pulls.length) return;
  const artifacts = await allGithub<Artifact>(`/repos/${repository}/actions/runs/${run.id}/artifacts`, 'artifacts');
  const artifact = artifacts.find(item => item.name === `visual-report-${run.id}-${run.run_attempt}`);
  const expiresAt = artifact && reportExpiry(artifact);
  let summary: Summary | undefined;
  let published: { gallery: string; image?: string } | undefined;
  if (artifact && expiresAt) {
    try {
      summary = readCommentSummary(unpackArchive(await downloadGithub(`/repos/${repository}/actions/artifacts/${artifact.id}/zip`)));
    } catch (error) { console.error('集計の取得に失敗しました:', error); }
    if (transferred) {
      const base = `${site}/runs/${run.id}-${artifact.id}`;
      const gallery = `${base}/gallery.html`;
      const image = summary?.preview ? `${base}/${summary.preview}` : undefined;
      if (await waitForReport(gallery, image)) published = { gallery, image };
    }
  }
  const body = commentBody(run, summary, expiresAt, published);
  const marker = `<!-- tkw-visual-result:${run.id}:${run.run_attempt} -->`;
  for (const pull of pulls) {
    const comments = await allGithub<{ id: number; body: string; user: { login: string; type: string } }>(`/repos/${repository}/issues/${pull.number}/comments`, '');
    const existing = comments.find(comment => comment.user.login === 'github-actions[bot]' && comment.user.type === 'Bot' && comment.body.includes(marker));
    await github(existing ? `/repos/${repository}/issues/comments/${existing.id}` : `/repos/${repository}/issues/${pull.number}/comments`, {
      method: existing ? 'PATCH' : 'POST', body: JSON.stringify({ body }),
    });
    console.log(`PR #${pull.number} にビジュアルテスト結果を${existing ? '更新' : '投稿'}しました`);
  }
}

if (import.meta.main) await postVisualComment(process.argv[2] ?? '', process.env.REPORT_TRANSFER_OUTCOME === 'success');
