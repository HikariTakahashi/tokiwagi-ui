import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { unzipSync, zipSync } from 'fflate';
import packageJson from '../package.json';

export const repository = 'HikariTakahashi/tokiwagi-ui';
export const storageRepository = 'HikariTakahashi/tokiwagi-ui-visual-results';
export const baselineTag = 'visual-test-baselines';
export const baselineDirectory = resolve(import.meta.dir, '../.visual-baselines');
export const playwrightVersion = packageJson.devDependencies['@playwright/test'];
export const retentionMs = 7 * 24 * 60 * 60 * 1000;
export const baselineFiles = ['react', 'vue'].flatMap(framework => ['firefox', 'webkit'].flatMap(browser =>
  ['bell', 'grip-vertical', 'moon', 'tool'].flatMap(name => [16, 20, 24, 32].map(size =>
    `icons.visual.ts-snapshots/${framework}-${name}-${size}-${browser}-linux.png`,
  )),
));
export const sha256 = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');

export function safeArchiveName(name: string) {
  return name.length > 0 && !name.startsWith('/') && !/^[a-z]:/i.test(name) && !name.includes('\\') && !name.includes('\0') &&
    name.split('/').filter((part, index, all) => !(part === '' && index === all.length - 1)).every(part => part !== '' && part !== '.' && part !== '..');
}

// 展開先を逸脱する名前・過大な展開を拒否する。ZIP内の属性は引き継がず通常ファイルだけを書く。
export function unpackArchive(bytes: Uint8Array, limit = 100 * 1024 * 1024) {
  if (bytes.length > limit) throw new Error('画像アーカイブが大きすぎます');
  let size = 0;
  let count = 0;
  return unzipSync(bytes, { filter: entry => {
    if (!safeArchiveName(entry.name)) throw new Error(`不正なアーカイブ内パス: ${entry.name}`);
    size += entry.originalSize;
    if (++count > 20000 || size > limit) throw new Error('画像アーカイブの展開量が上限を超えています');
    return !entry.name.endsWith('/');
  } });
}

export type BaselineMetadata = { schemaVersion: 1; sourceSha: string; playwrightVersion: string; createdAt: string };
export type BaselinePointer = BaselineMetadata & { assetId: number; assetName: string; sha256: string };

export function validateBaseline(bytes: Uint8Array) {
  const files = unpackArchive(bytes, 8 * 1024 * 1024);
  const metadata: BaselineMetadata = JSON.parse(new TextDecoder().decode(files['baseline.json']));
  if (metadata.schemaVersion !== 1 || !/^[a-f0-9]{40}$/.test(metadata.sourceSha) ||
    metadata.playwrightVersion !== playwrightVersion || !Number.isFinite(Date.parse(metadata.createdAt))) {
    throw new Error('基準画像のメタデータまたはPlaywrightバージョンが不正です');
  }
  if (Object.keys(files).sort().join('\n') !== [...baselineFiles, 'baseline.json'].sort().join('\n')) {
    throw new Error('基準画像は指定された64条件がすべて必要です');
  }
  for (const name of baselineFiles) {
    const png = Buffer.from(files[name]!);
    const size = Number(name.match(/-(16|20|24|32)-(firefox|webkit)-linux\.png$/)![1]) + 32;
    if (png.length < 24 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
      png.readUInt32BE(16) !== size || png.readUInt32BE(20) !== size) throw new Error(`基準PNGの寸法・形式が不正です: ${name}`);
  }
  return { files, metadata };
}

export async function createBaselineArchive(directory: string, sourceSha: string) {
  const metadata: BaselineMetadata = { schemaVersion: 1, sourceSha, playwrightVersion, createdAt: new Date().toISOString() };
  const files: Record<string, Uint8Array> = { 'baseline.json': new TextEncoder().encode(JSON.stringify(metadata)) };
  for (const name of baselineFiles) files[name] = await readFile(join(directory, name));
  const bytes = zipSync(files, { level: 6 });
  validateBaseline(bytes);
  return bytes;
}

export async function github(path: string, init: RequestInit = {}, token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN) {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('GitHub APIのパスが不正です');
  const headers = new Headers(init.headers);
  headers.set('Accept', headers.get('Accept') ?? 'application/vnd.github+json');
  headers.set('User-Agent', 'tokiwagi-visual-tests');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`https://api.github.com${path}`, { ...init, headers, redirect: 'manual', signal: AbortSignal.timeout(60000) });
  if (!response.ok && response.status !== 302) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response;
}

// 署名付きダウンロードURLにはGitHubトークンを渡さない。
export async function downloadGithub(path: string, limit = 100 * 1024 * 1024) {
  let response = await github(path, { headers: { Accept: 'application/octet-stream' } });
  if (response.status === 302) {
    const url = new URL(response.headers.get('location')!);
    if (url.protocol !== 'https:') throw new Error('ダウンロード先はHTTPSである必要があります');
    response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  }
  if (!response.ok) throw new Error(`画像のダウンロードに失敗しました: ${response.status}`);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of response.body!) {
    size += chunk.length;
    if (size > limit) throw new Error('画像ダウンロードの上限を超えました');
    chunks.push(chunk);
  }
  return new Uint8Array(Buffer.concat(chunks));
}

export async function allGithub<T>(path: string, key: string): Promise<T[]> {
  const result: T[] = [];
  for (let page = 1; ; page++) {
    const json = await (await github(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`)).json() as Record<string, T[]>;
    const items = key ? json[key] : json as unknown as T[];
    if (!Array.isArray(items)) throw new Error('GitHub一覧の形式が不正です');
    result.push(...items);
    if (items.length < 100) return result;
  }
}

export async function restoreBaselines(localArchive?: string) {
  let bytes: Uint8Array;
  if (localArchive) bytes = await readFile(localArchive);
  else {
    const release = await (await github(`/repos/${storageRepository}/releases/tags/${baselineTag}`)).json() as { body: string };
    const pointer: BaselinePointer = JSON.parse(release.body);
    if (!Number.isSafeInteger(pointer.assetId) || pointer.assetId <= 0 || !/^[a-f0-9]{64}$/.test(pointer.sha256)) throw new Error('承認済み基準画像の参照が不正です');
    bytes = await downloadGithub(`/repos/${storageRepository}/releases/assets/${pointer.assetId}`, 8 * 1024 * 1024);
    if (sha256(bytes) !== pointer.sha256) throw new Error('基準画像アーカイブのSHA-256が一致しません');
    const { metadata } = validateBaseline(bytes);
    if (metadata.sourceSha !== pointer.sourceSha) throw new Error('基準画像の承認元コミットが一致しません');
  }
  const { files, metadata } = validateBaseline(bytes);
  await rm(baselineDirectory, { recursive: true, force: true });
  for (const [name, content] of Object.entries(files)) {
    const target = join(baselineDirectory, name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  console.log(`外部基準画像64枚を取得: ${metadata.sourceSha}`);
}

export function storageToken() {
  const token = process.env.VISUAL_STORAGE_TOKEN;
  if (!token) throw new Error('保管用リポジトリへの書き込みにはVISUAL_STORAGE_TOKENが必要です');
  return token;
}

export async function uploadStorageAsset(releaseId: number, name: string, bytes: Uint8Array, token: string) {
  const response = await fetch(`https://uploads.github.com/repos/${storageRepository}/releases/${releaseId}/assets?name=${encodeURIComponent(name)}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/zip', 'User-Agent': 'tokiwagi-visual-tests' },
    body: new Uint8Array(bytes), signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`画像アーカイブのアップロードに失敗: ${response.status}`);
  return await response.json() as { id: number; name: string };
}

export async function promoteBaselines(archive: string) {
  const bytes = await readFile(archive);
  const { metadata } = validateBaseline(bytes);
  const token = storageToken();
  let release: { id: number; assets: { id: number; name: string }[] };
  try {
    release = await (await github(`/repos/${storageRepository}/releases/tags/${baselineTag}`, {}, token)).json() as typeof release;
  } catch (error) {
    if (!String(error).includes('GitHub API 404:')) throw error;
    release = await (await github(`/repos/${storageRepository}/releases`, { method: 'POST', body: JSON.stringify({
      tag_name: baselineTag, target_commitish: 'main', name: 'Visual test baselines',
      body: '基準画像の初期登録中', prerelease: true, make_latest: 'false',
    }) }, token)).json() as typeof release;
  }
  const assetName = `baselines-${metadata.sourceSha}-${sha256(bytes).slice(0, 12)}.zip`;
  let asset = release.assets.find(item => item.name === assetName);
  if (!asset) {
    asset = await uploadStorageAsset(release.id, assetName, bytes, token);
  }
  const pointer: BaselinePointer = { ...metadata, assetId: asset.id, assetName, sha256: sha256(bytes) };
  // ZIPの保存完了後に参照を1回で切り替える。旧画像は削除せず承認履歴として保持する。
  await github(`/repos/${storageRepository}/releases/${release.id}`, { method: 'PATCH', body: JSON.stringify({ body: JSON.stringify(pointer, null, 2) }) }, token);
  console.log(`承認済み基準画像を更新: ${metadata.sourceSha}`);
}

export async function promoteRun(runId: string) {
  if (!/^\d+$/.test(runId)) throw new Error('候補生成の実行IDは数値で指定してください');
  const run = await (await github(`/repos/${repository}/actions/runs/${runId}`)).json() as {
    id: number; run_attempt: number; event: string; path: string; conclusion: string; head_sha: string; head_repository: { full_name: string };
  };
  if (run.event !== 'workflow_dispatch' || run.path !== '.github/workflows/visual.yml' ||
    run.conclusion !== 'success' || run.head_repository.full_name !== repository) throw new Error('成功した同リポジトリの手動生成だけを承認できます');
  const artifacts = await allGithub<{ id: number; name: string; expired: boolean }>(`/repos/${repository}/actions/runs/${runId}/artifacts`, 'artifacts');
  const candidate = artifacts.find(item => item.name === `visual-baselines-${run.id}-${run.run_attempt}` && !item.expired);
  if (!candidate) throw new Error('承認する基準画像候補がありません（期限切れを含む）');
  const files = unpackArchive(await downloadGithub(`/repos/${repository}/actions/artifacts/${candidate.id}/zip`, 8 * 1024 * 1024), 8 * 1024 * 1024);
  if (Object.keys(files).join('') !== 'baselines.zip') throw new Error('基準画像候補の構成が不正です');
  const bytes = files['baselines.zip']!;
  if (validateBaseline(bytes).metadata.sourceSha !== run.head_sha) throw new Error('候補のコミットが実行結果と一致しません');
  const temporary = join(process.env.RUNNER_TEMP ?? '/tmp', `tkw-baseline-${run.id}-${run.run_attempt}.zip`);
  await writeFile(temporary, bytes);
  try { await promoteBaselines(temporary); }
  finally { await rm(temporary, { force: true }); }
}

if (import.meta.main) {
  const [command, argument] = process.argv.slice(2);
  if (command === 'restore') await restoreBaselines(argument);
  else if (command === 'promote' && argument) await promoteBaselines(argument);
  else if (command === 'promote-run' && argument) await promoteRun(argument);
  else throw new Error('使用方法: visual-storage.ts restore [ZIP] | promote ZIP | promote-run ID');
}
