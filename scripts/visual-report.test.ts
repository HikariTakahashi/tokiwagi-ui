import { expect, test } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildGallery, escapeHtml } from './visual-report';

// ブランチ名・テスト名などの文字列をHTMLとして実行させない。
test('画像一覧の表示名をHTMLとして解釈しない', () => {
  expect(escapeHtml('<script a="x">&\'</script>')).toBe('&lt;script a=&quot;x&quot;&gt;&amp;&#39;&lt;/script&gt;');
});

// ブラウザの起動失敗でも、画像未取得の条件とレポートへの導線を一覧に残す。
test('撮影前に失敗した条件も画像一覧に表示する', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-gallery-'));
  try {
    const input = join(directory, 'report.json');
    await writeFile(input, JSON.stringify({ suites: [{ specs: [{ title: '<失敗>', tests: [{ projectName: 'firefox', results: [{ status: 'failed', attachments: [] }] }] }] }] }));
    await buildGallery(input, join(directory, 'site'));
    const html = await readFile(join(directory, 'site/gallery.html'), 'utf8');
    expect(html).toContain('&lt;失敗&gt;');
    expect(html).toContain('画像未取得');
    expect(html).toContain('index.html#?q=');
    expect(JSON.parse(await readFile(join(directory, 'site/summary.json'), 'utf8'))).toEqual({ schemaVersion: 1, passed: 0, failed: 1, skipped: 0, preview: '' });
  } finally { await rm(directory, { recursive: true, force: true }); }
});

// 成功・失敗・未実行を分け、コメントの確認画像には成功画像より失敗画像を優先する。
test('集計に各条件の最終結果を使い失敗画像をプレビューに選ぶ', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-summary-'));
  await mkdir('test-results', { recursive: true });
  const images = await mkdtemp(join(process.cwd(), 'test-results/comment-images-'));
  try {
    const current = join(images, 'current.png');
    await mkdir(images, { recursive: true });
    await writeFile(current, new Uint8Array([1, 2, 3]));
    const result = (status: string) => ({ status, attachments: [{ name: 'current', contentType: 'image/png', path: current }] });
    const input = join(directory, 'report.json');
    await writeFile(input, JSON.stringify({ suites: [{ specs: [{ title: '条件', tests: [
      { projectName: 'firefox', results: [result('failed'), result('passed')] },
      { projectName: 'webkit', results: [result('timedOut')] },
      { projectName: 'webkit', results: [] },
    ] }] }] }));
    await buildGallery(input, join(directory, 'site'));
    expect(JSON.parse(await readFile(join(directory, 'site/summary.json'), 'utf8'))).toEqual({ schemaVersion: 1, passed: 1, failed: 1, skipped: 1, preview: 'gallery-images/1.png' });
    expect(await readFile(join(directory, 'site/gallery-images/1.png'))).toEqual(Buffer.from([1, 2, 3]));
  } finally {
    await rm(directory, { recursive: true, force: true });
    await rm(images, { recursive: true, force: true });
  }
});
