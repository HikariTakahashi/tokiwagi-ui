import { expect, test } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { logoSizes } from '../lib/logo';
import { assertBrandHtml } from '../lib/brand-test-helpers';
import type { AstroBrandPreviews } from './astro-brand-previews';

// 別プロセスの公開入口から実HTMLを生成し、静的Storybookにも全サイズを収録する。
test('Storybook用Astroブランド見本は3サイズの実コンポーネントを収録する', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-brand-test-'));
  try {
    const output = join(directory, 'previews.json');
    const process = Bun.spawn(['bun', 'scripts/render-astro-brand-previews.ts', output], {
      cwd: new URL('../../', import.meta.url).pathname, stdout: 'ignore', stderr: 'pipe',
    });
    const error = await new Response(process.stderr).text();
    expect(await process.exited, error).toBe(0);
    const previews = JSON.parse(await readFile(output, 'utf8')) as AstroBrandPreviews;
    expect(Object.keys(previews)).toEqual(logoSizes.map(String));
    for (const size of logoSizes) assertBrandHtml(previews[size], size);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
