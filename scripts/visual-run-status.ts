import { appendFileSync } from 'node:fs';

// 依存導入前にも動かすため、アーカイブ処理などの外部依存をimportしない。
export async function visualWasSkipped(runId: string, repository = process.env.GITHUB_REPOSITORY ?? 'HikariTakahashi/tokiwagi-ui') {
  if (!/^\d+$/.test(runId) || repository !== 'HikariTakahashi/tokiwagi-ui') throw new Error('画像比較の実行IDまたはリポジトリが不正です');
  const get = async (path: string) => {
    const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'tokiwagi-visual-tests', Authorization: `Bearer ${process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? ''}` },
      redirect: 'error', signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw new Error(`画像比較の状態取得に失敗しました: ${response.status}`);
    return response.json();
  };
  const run = await get(`/actions/runs/${runId}`) as { path: string; status: string; run_attempt: number; repository: { full_name: string } };
  if (run.path !== '.github/workflows/visual.yml' || run.status !== 'completed' || run.repository.full_name !== repository || !Number.isSafeInteger(run.run_attempt) || run.run_attempt < 1) {
    throw new Error('対象は元リポジトリの完了したVisual Testsに限定します');
  }
  for (let page = 1; ; page++) {
    const { jobs } = await get(`/actions/runs/${runId}/attempts/${run.run_attempt}/jobs?per_page=100&page=${page}`) as { jobs: { name: string; conclusion: string | null }[] };
    const visual = jobs.find(job => job.name === 'tkw-visual');
    if (visual) return visual.conclusion === 'skipped';
    // ジョブ欠落は撮影前の障害として通知を維持する。省略と推測しない。
    if (jobs.length < 100) return false;
  }
}

if (import.meta.main) {
  const skipped = await visualWasSkipped(process.argv[2] ?? '');
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `skipped=${skipped}\n`);
  console.log(skipped ? '画像比較が省略されたため転送・PRコメントを省略します' : '画像比較は省略されていないため後続処理を継続します');
}
