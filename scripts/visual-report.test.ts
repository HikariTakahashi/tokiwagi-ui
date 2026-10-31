import { expect, test } from 'bun:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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
  } finally { await rm(directory, { recursive: true, force: true }); }
});
