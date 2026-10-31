import { expect, spyOn, test } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { zipSync } from 'fflate';
import { baselineFiles, downloadGithub, playwrightVersion, promoteBaselines, safeArchiveName, unpackArchive, validateBaseline } from './visual-storage';

function fixture() {
  const files: Record<string, Uint8Array> = {};
  for (const name of baselineFiles) {
    const size = Number(name.match(/-(16|20|24|32)-(firefox|webkit)-linux\.png$/)![1]) + 32;
    // 転送検証用。画像の内容ではなくPNGのヘッダー・寸法を対象とする。
    const header = Buffer.alloc(24);
    Buffer.from('89504e470d0a1a0a', 'hex').copy(header);
    header.writeUInt32BE(size, 16);
    header.writeUInt32BE(size, 20);
    files[name] = header;
  }
  files['baseline.json'] = new TextEncoder().encode(JSON.stringify({
    schemaVersion: 1, sourceSha: 'a'.repeat(40), playwrightVersion, createdAt: '2026-10-30T00:00:00Z',
  }));
  return files;
}

// 4図柄・4サイズ・2方式・2ブラウザの64条件が揃ったZIPだけを受け付ける。
test('外部基準画像の64条件と生成元を復元できる', () => {
  const decoded = validateBaseline(zipSync(fixture()));
  expect(Object.keys(decoded.files)).toHaveLength(65);
  expect(decoded.metadata.sourceSha).toBe('a'.repeat(40));
});

// 部分生成や余分なファイルを基準として承認し、比較範囲が減ったり別データが混入したりしない。
test('欠落または余分なファイルのある基準画像は拒否する', () => {
  const missing = fixture();
  delete missing[baselineFiles[0]!];
  expect(() => validateBaseline(zipSync(missing))).toThrow('64条件');
  expect(() => validateBaseline(zipSync({ ...fixture(), 'extra.png': new Uint8Array() }))).toThrow('64条件');
});

// ツール更新後の古い画像や異なるサイズの画像を、承認済みの基準として誤利用しない。
test('Playwrightのバージョン違いとPNG寸法違いは拒否する', () => {
  const version = fixture();
  version['baseline.json'] = new TextEncoder().encode(JSON.stringify({ schemaVersion: 1, sourceSha: 'a'.repeat(40), playwrightVersion: '0.0.0', createdAt: '2026-10-30T00:00:00Z' }));
  expect(() => validateBaseline(zipSync(version))).toThrow('バージョン');
  const dimension = fixture();
  dimension[baselineFiles[0]!] = new Uint8Array(24);
  expect(() => validateBaseline(zipSync(dimension))).toThrow('寸法・形式');
});

// 別パスへの書き込み、Windows形式のパス、過大な展開をアーカイブ読み込み時に止める。
test('展開先を逸脱するパスと過大なZIPを拒否する', () => {
  for (const name of ['../secret', '/secret', 'C:/secret', 'a\\secret', 'a/../secret', 'a//secret']) expect(safeArchiveName(name)).toBe(false);
  expect(() => unpackArchive(zipSync({ '../secret': new Uint8Array([1]) }))).toThrow('不正なアーカイブ内パス');
  expect(() => unpackArchive(zipSync({ 'large.txt': new Uint8Array(10000) }), 1000)).toThrow('展開量');
});

// ZIP保存に失敗しても、比較に使う承認済み画像の参照を壊さない。
test('基準画像のアップロード失敗時は承認済み参照を切り替えない', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-promote-'));
  const token = process.env.VISUAL_STORAGE_TOKEN;
  process.env.VISUAL_STORAGE_TOKEN = 'test-token';
  const methods: string[] = [];
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    methods.push(init?.method ?? 'GET');
    if (String(input).includes('uploads.github.com')) return new Response('', { status: 500 });
    return Response.json({ id: 1, assets: [] });
  }, { preconnect: fetch.preconnect }));
  try {
    const archive = join(directory, 'baselines.zip');
    await writeFile(archive, zipSync(fixture()));
    const error = await promoteBaselines(archive).then(() => undefined, error => error);
    expect(String(error)).toContain('アップロードに失敗');
    expect(methods).toEqual(['GET', 'POST']);
  } finally {
    fetchMock.mockRestore();
    if (token === undefined) delete process.env.VISUAL_STORAGE_TOKEN;
    else process.env.VISUAL_STORAGE_TOKEN = token;
    await rm(directory, { recursive: true, force: true });
  }
});

// GitHub APIの認証と、別ホストの署名付きダウンロードを分離する。
test('画像ダウンロードの転送先にはGitHubトークンを渡さない', async () => {
  const token = process.env.GH_TOKEN;
  process.env.GH_TOKEN = 'test-token';
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (String(input).startsWith('https://api.github.com/')) {
      expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer test-token');
      expect(new Headers(init?.headers).get('Accept')).toBe('application/octet-stream');
      return new Response('', { status: 302, headers: { location: 'https://example.test/download' } });
    }
    expect(String(input)).toBe('https://example.test/download');
    expect(new Headers(init?.headers).has('Authorization')).toBe(false);
    return new Response(new Uint8Array([1, 2, 3]));
  }, { preconnect: fetch.preconnect }));
  try { expect(await downloadGithub('/test')).toEqual(new Uint8Array([1, 2, 3])); }
  finally {
    fetchMock.mockRestore();
    if (token === undefined) delete process.env.GH_TOKEN;
    else process.env.GH_TOKEN = token;
  }
});

// ActionsのZIP取得にRelease assets用の形式を指定すると実APIが415を返すため、形式を使い分ける。
test('Actions成果物のZIPはJSONメディアタイプで取得する', async () => {
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (String(input).startsWith('https://api.github.com/')) {
      if (new Headers(init?.headers).get('Accept') !== 'application/vnd.github+json') return new Response('', { status: 415 });
      return new Response('', { status: 302, headers: { location: 'https://example.test/artifact.zip' } });
    }
    expect(new Headers(init?.headers).has('Authorization')).toBe(false);
    return new Response(new Uint8Array([1, 2, 3]));
  }, { preconnect: fetch.preconnect }));
  try { expect(await downloadGithub('/repos/owner/repo/actions/artifacts/123/zip')).toEqual(new Uint8Array([1, 2, 3])); }
  finally { fetchMock.mockRestore(); }
});
