import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import type { JSONReport, JSONReportSuite } from '@playwright/test/reporter';

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const page = (title: string, body: string) => `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>
body{font:15px/1.6 system-ui;margin:0;padding:32px;background:var(--tkw-color-neutral-50);color:var(--tkw-color-neutral-900)}main{max-width:1200px;margin:auto}a{color:inherit}h1{font-size:26px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card{padding:16px;background:var(--tkw-color-neutral-0);border:1px solid var(--tkw-color-neutral-200);border-radius:8px}.card img{display:block;min-width:96px;min-height:96px;object-fit:contain;margin:16px auto;image-rendering:auto}small{color:var(--tkw-color-neutral-600)}li{margin:16px 0}
</style><link rel="stylesheet" href="tokens.css"><main><h1>${escapeHtml(title)}</h1>${body}</main></html>`;

export async function buildGallery(reportPath = 'test-results/report.json', destination = 'playwright-report') {
  let report: JSONReport;
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return; throw error; }
  const root = resolve('test-results');
  const cards: string[] = [];
  const summary = { schemaVersion: 1, passed: 0, failed: 0, skipped: 0, preview: '' };
  let failurePreview = '';
  async function visit(suites: JSONReportSuite[]) {
    for (const suite of suites) {
      for (const spec of suite.specs) for (const test of spec.tests) {
        const result = test.results.at(-1);
        if (result?.status === 'passed') summary.passed++;
        else if (result?.status === 'skipped' || !result) summary.skipped++;
        else summary.failed++;
        const current = result?.attachments.find(attachment => attachment.name === 'current' && attachment.contentType === 'image/png');
        let image = '';
        if (current?.path) {
          const source = resolve(current.path);
          if (!source.startsWith(root + sep)) throw new Error('撮影画像のパスがテスト出力先の外です');
          const filename = `gallery-images/${cards.length}.png`;
          await mkdir(join(destination, 'gallery-images'), { recursive: true });
          await cp(source, join(destination, filename));
          if (!summary.preview) summary.preview = filename;
          if (result?.status !== 'passed' && !failurePreview) failurePreview = filename;
          image = `<a href="${filename}"><img src="${filename}" alt="${escapeHtml(spec.title)}"></a>`;
        }
        const query = encodeURIComponent(`${test.projectName} ${spec.title}`);
        cards.push(`<article class="card"><strong>${escapeHtml(spec.title)}</strong><br><small>${escapeHtml(test.projectName)} / ${escapeHtml(result?.status ?? '未実行')}</small>${image || '<p>画像未取得</p>'}<a href="index.html#?q=${query}">詳細・差分を見る</a></article>`);
      }
      await visit(suite.suites ?? []);
    }
  }
  await mkdir(destination, { recursive: true });
  await visit(report.suites);
  summary.preview = failurePreview || summary.preview;
  await writeFile(join(destination, 'summary.json'), JSON.stringify(summary));
  await cp(new URL('../tokens/neutrals.css', import.meta.url), join(destination, 'tokens.css'));
  await writeFile(join(destination, 'gallery.html'), page('Tokiwagi UI 画像比較', `<p><a href="index.html">Playwrightレポート</a> · ${cards.length}条件</p><div class="grid">${cards.join('')}</div>`));
}
