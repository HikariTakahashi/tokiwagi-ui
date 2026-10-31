import { allGithub, downloadGithub, github, repository, retentionMs, sha256, storageRepository, storageToken, unpackArchive, uploadStorageAsset } from './visual-storage';

type Artifact = { id: number; name: string; created_at: string; expires_at: string; expired: boolean };
type Release = { id: number; assets: { id: number; name: string }[] };

export function reportExpiry(artifact: Artifact, now = Date.now()) {
  const created = Date.parse(artifact.created_at);
  const expires = Math.min(Date.parse(artifact.expires_at), created + retentionMs);
  if (artifact.expired || !Number.isFinite(created) || !Number.isFinite(expires) || created > now || expires <= now) return;
  return new Date(expires).toISOString();
}

export async function transferReport(runId: string) {
  if (!/^\d+$/.test(runId)) throw new Error('転送する実行IDは数値で指定してください');
  const run = await (await github(`/repos/${repository}/actions/runs/${runId}`)).json() as {
    id: number; run_attempt: number; path: string; status: string; head_sha: string; head_branch: string;
    repository: { full_name: string }; head_repository: { full_name: string } | null;
  };
  if (run.path !== '.github/workflows/visual.yml' || run.status !== 'completed' || run.repository.full_name !== repository) {
    throw new Error('転送対象は元リポジトリの完了したVisual Testsに限定します');
  }
  if (run.head_repository?.full_name !== repository) {
    console.log('fork由来のレポートはActions内で確認してください');
    return;
  }
  const artifacts = await allGithub<Artifact>(`/repos/${repository}/actions/runs/${run.id}/artifacts`, 'artifacts');
  const artifact = artifacts.find(item => item.name === `visual-report-${run.id}-${run.run_attempt}`);
  const expiresAt = artifact && reportExpiry(artifact);
  if (!artifact || !expiresAt) { console.log('転送できる有効なレポートがありません'); return; }
  const bytes = await downloadGithub(`/repos/${repository}/actions/artifacts/${artifact.id}/zip`);
  const files = unpackArchive(bytes);
  if (!files['index.html'] && !files['playwright-report/index.html']) throw new Error('レポートのindex.htmlがありません');
  const digest = sha256(bytes);
  const metadata = { schemaVersion: 1, sourceRepository: repository, runId: run.id, runAttempt: run.run_attempt,
    artifactId: artifact.id, sourceSha: run.head_sha, branch: run.head_branch, createdAt: artifact.created_at,
    expiresAt, sha256: digest };
  const token = storageToken();
  const tag = `visual-report-${run.id}-${run.run_attempt}`;
  let release: Release;
  try { release = await (await github(`/repos/${storageRepository}/releases/tags/${tag}`, {}, token)).json() as Release; }
  catch (error) {
    if (!String(error).includes('GitHub API 404:')) throw error;
    release = await (await github(`/repos/${storageRepository}/releases`, { method: 'POST', body: JSON.stringify({
      tag_name: tag, target_commitish: 'main', name: `Visual report ${run.id} (${run.run_attempt})`,
      body: JSON.stringify(metadata), draft: true, prerelease: true, make_latest: 'false',
    }) }, token)).json() as Release;
  }
  const assetName = `report-${digest.slice(0, 12)}.zip`;
  const asset = release.assets.find(item => item.name === assetName) ?? await uploadStorageAsset(release.id, assetName, bytes, token);
  await github(`/repos/${storageRepository}/releases/${release.id}`, { method: 'PATCH',
    body: JSON.stringify({ body: JSON.stringify({ ...metadata, assetId: asset.id }, null, 2), draft: false, make_latest: 'false' }) }, token);
  await github(`/repos/${storageRepository}/dispatches`, { method: 'POST', body: JSON.stringify({ event_type: 'visual-report-updated' }) }, token);
  console.log(`レポートを ${storageRepository} へ転送しました（公開期限 ${expiresAt}）`);
}

if (import.meta.main) await transferReport(process.argv[2] ?? '');
