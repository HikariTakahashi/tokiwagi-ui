import { expect, test } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { logoSizes } from '../lib/logo';
import { assertLogoHtml } from '../lib/logo-test-helpers';
import type { AstroLogoPreviews } from './astro-logo-previews';

// Storybookが使う別プロセスの実描画を検査し、全サイズ・読み上げ状態を静的出力に収録する。
test('Storybook用Astroロゴ見本は全サイズと読み上げ状態の実コンポーネントを収録する', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-logo-test-'));
  const output = join(directory, 'previews.json');
  try {
    const process = Bun.spawn(['bun', 'scripts/render-astro-logo-previews.ts', output], {
      cwd: new URL('../../', import.meta.url).pathname, stdout: 'ignore', stderr: 'pipe',
    });
    const error = await new Response(process.stderr).text();
    expect(await process.exited, error).toBe(0);
    const previews = JSON.parse(await readFile(output, 'utf8')) as AstroLogoPreviews;
    expect(Object.keys(previews)).toEqual(logoSizes.map(String));
    for (const size of logoSizes) {
      assertLogoHtml(previews[size].standalone, size, false);
      assertLogoHtml(previews[size].decorative, size, true);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
