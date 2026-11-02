import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data.ts';
import type { AstroTextPreviews } from '../src/stories/text-preview';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);

export function astroTextPreviewsPlugin(): Plugin {
  const dependencies = ['scripts/render-astro-text-previews.ts', 'src/astro/TText.astro',
    'src/astro/TTextProps.ts', 'src/lib/text.ts', 'src/astro/index.ts'].map(path => root + path);
  return astroPreviewDataPlugin('texts', async (): Promise<AstroTextPreviews> => {
    const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-texts-'));
    try {
      const output = join(directory, 'previews.json');
      await execute('bun', ['scripts/render-astro-text-previews.ts', output], { cwd: root });
      return JSON.parse(await readFile(output, 'utf8'));
    } finally { await rm(directory, { recursive: true, force: true }); }
  }, dependencies);
}
