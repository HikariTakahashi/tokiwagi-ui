import { expect, spyOn, test } from 'bun:test';
import { zipSync } from 'fflate';
import { commentBody, postVisualComment, readCommentSummary, waitForReport } from './visual-comment';
import { repository, retentionMs } from './visual-storage';

const summary = { schemaVersion: 1 as const, passed: 63, failed: 1, skipped: 0, preview: 'gallery-images/2.png' };
const run = { id: 123, run_attempt: 2, head_sha: 'a'.repeat(40) };
const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));

// 利用者が指定した文面・件数・短いSHA・日本時間の削除予定日時とクリックできる画像を出力する。
test('指定された5行の形式で結果と画像をコメントに表示する', () => {
  expect(commentBody(run, summary, '2026-11-07T04:38:39Z', { gallery: 'https://example.com/gallery.html', image: 'https://example.com/2.png' })).toBe(
    '✅ ビジュアルテスト完了  \n対象コミット：`aaaaaaa`  \n成功：63件 ／ 失敗：1件  \n保存期間：2026-11-07 13:38:39 JST\n\n[![ここに確認用の画像を表示](https://example.com/2.png)](https://example.com/gallery.html)\n\n<!-- tkw-visual-result:123:2 -->');
});

// 画像も集計もない障害を成功0件・失敗0件と誤報せず、ログへ誘導する。
test('撮影前の障害では集計不能と保存ファイルなしを通知する', () => {
  const body = commentBody(run);
  expect(body).toContain('⚠️');
  expect(body).toContain('成功：取得できず ／ 失敗：取得できず');
  expect(body).toContain('保存期間：保存ファイルなし');
  expect(body).toContain('/actions/runs/123/attempts/2');
  expect(body).not.toContain('![');
});

// 外部URL・パス遡り・欠損画像・不正な件数を、権限付き通知の本文へ持ち込めない。
test('成果物の集計から使えるのは整数と同梱の既知画像パスだけに限定する', () => {
  const files = { 'summary.json': encode(summary), 'gallery-images/2.png': new Uint8Array([1]) };
  expect(readCommentSummary(files)).toEqual(summary);
  for (const override of [{ preview: 'https://example.com/a.png' }, { preview: '../a.png' }, { passed: -1 }, { failed: 1.5 }, { preview: 'gallery-images/3.png' }, { passed: 0, failed: 0, skipped: 0 }]) {
    expect(() => readCommentSummary({ ...files, 'summary.json': encode({ ...summary, ...override }) })).toThrow('不正');
  }
  expect(readCommentSummary({})).toBeUndefined();
});

// Pagesの公開前は再確認し、画像とHTMLの両方が公開されて初めて埋め込み可能にする。
test('公開待ちはトークンを渡さず404から公開済みに変わるまで待つ', async () => {
  let requests = 0;
  let pauses = 0;
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    expect(init?.method).toBe('HEAD');
    expect(new Headers(init?.headers).has('Authorization')).toBe(false);
    requests++;
    return new Response(null, { status: requests <= 2 ? 404 : 200, headers: { 'content-type': String(input).endsWith('.png') ? 'image/png' : 'text/html' } });
  }, { preconnect: fetch.preconnect }));
  try {
    expect(await waitForReport('https://example.com/gallery.html', 'https://example.com/a.png', 2, async () => { pauses++; })).toBe(true);
    expect(pauses).toBe(1);
    expect(requests).toBe(4);
  } finally { fetchMock.mockRestore(); }
});

// 公開に失敗しても無限に待たず、画像を埋め込まずに通知するための結果を返す。
test('公開待ちは上限回数で終了する', async () => {
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async () => new Response(null, { status: 404 }), { preconnect: fetch.preconnect }));
  try {
    expect(await waitForReport('https://example.com/gallery.html', undefined, 2, async () => {})).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  } finally { fetchMock.mockRestore(); }
});

// 同じ実行の再送はbot自身のコメントを更新し、人のコメントや別の実行は変更しない。
test('公開後に関連PRへ通知し再送時はbotの同じ実行のコメントだけを更新する', async () => {
  const bytes = zipSync({ 'summary.json': encode(summary), 'gallery-images/2.png': new Uint8Array([1]) });
  const marker = '<!-- tkw-visual-result:123:2 -->';
  const writes: { url: string; body: string }[] = [];
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const url = String(input);
    if (init?.method === 'HEAD') return new Response(null, { headers: { 'content-type': url.endsWith('.png') ? 'image/png' : 'text/html' } });
    if (url.endsWith('/actions/runs/123')) return Response.json({ ...run, event: 'pull_request', path: '.github/workflows/visual.yml', status: 'completed', repository: { full_name: repository }, head_repository: { full_name: repository } });
    if (url.includes('/pulls?')) return Response.json([{ number: 61, state: 'open', base: { ref: 'main', repo: { full_name: repository } }, head: { repo: { full_name: repository } } }]);
    if (url.includes('/artifacts?')) return Response.json({ artifacts: [{ id: 3, name: 'visual-report-123-2', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + retentionMs).toISOString(), expired: false }] });
    if (url.endsWith('/actions/artifacts/3/zip')) return new Response(bytes);
    if (url.includes('/comments?')) return Response.json([
      { id: 10, body: marker, user: { login: 'HikariTakahashi', type: 'User' } },
      { id: 11, body: '<!-- tkw-visual-result:122:2 -->', user: { login: 'github-actions[bot]', type: 'Bot' } },
      ...(writes.length ? [{ id: 12, body: marker, user: { login: 'github-actions[bot]', type: 'Bot' } }] : []),
    ]);
    if (init?.method === 'POST' || init?.method === 'PATCH') { writes.push({ url, body: JSON.parse(String(init.body)).body }); return Response.json({ id: 12 }); }
    throw new Error(`想定外の通信: ${url}`);
  }, { preconnect: fetch.preconnect }));
  try {
    await postVisualComment('123', true);
    await postVisualComment('123', true);
    expect(writes.map(write => write.url)).toEqual([`https://api.github.com/repos/${repository}/issues/61/comments`, `https://api.github.com/repos/${repository}/issues/comments/12`]);
    expect(writes[0]!.body).toContain('/runs/123-3/gallery-images/2.png');
    expect(writes[0]!.body).toContain('成功：63件 ／ 失敗：1件');
    await postVisualComment('123', false);
    expect(writes[2]!.body).toContain('成功：63件 ／ 失敗：1件');
    expect(writes[2]!.body).toContain('画像を公開できなかった');
    expect(writes[2]!.body).not.toContain('![');
  } finally { fetchMock.mockRestore(); }
});

// 間違ったワークフロー・fork・mainのpush・候補生成ではPRコメントを書き込まない。
test('画像比較以外やPR以外の実行を通知しない', async () => {
  const base = { ...run, event: 'pull_request', path: '.github/workflows/visual.yml', status: 'completed', repository: { full_name: repository }, head_repository: { full_name: repository } };
  for (const override of [{ event: 'push' }, { event: 'workflow_dispatch' }, { head_repository: { full_name: 'someone/fork' } }, { path: '.github/workflows/ci.yml' }]) {
    const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async () => Response.json({ ...base, ...override }), { preconnect: fetch.preconnect }));
    try {
      if ('path' in override) {
        const error = await postVisualComment('123').then(() => undefined, error => error);
        expect(String(error)).toContain('Visual Testsに限定');
      }
      else await postVisualComment('123');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally { fetchMock.mockRestore(); }
  }
});

// 成果物がないテスト起動前の障害でも、関連PRへ集計不能のコメントを残す。
test('成果物がない場合もPRへログの確認先を通知する', async () => {
  let posted = '';
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(Object.assign(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const url = String(input);
    if (url.endsWith('/actions/runs/123')) return Response.json({ ...run, event: 'pull_request', path: '.github/workflows/visual.yml', status: 'completed', repository: { full_name: repository }, head_repository: { full_name: repository } });
    if (url.includes('/pulls?')) return Response.json([{ number: 61, state: 'open', base: { ref: 'main', repo: { full_name: repository } }, head: { repo: { full_name: repository } } }]);
    if (url.includes('/artifacts?')) return Response.json({ artifacts: [] });
    if (url.includes('/comments?')) return Response.json([]);
    if (init?.method === 'POST') { posted = JSON.parse(String(init.body)).body; return Response.json({}); }
    throw new Error(`想定外の通信: ${url}`);
  }, { preconnect: fetch.preconnect }));
  try {
    await postVisualComment('123');
    expect(posted).toContain('結果を取得できませんでした');
    expect(posted).toContain('/actions/runs/123/attempts/2');
  } finally { fetchMock.mockRestore(); }
});
