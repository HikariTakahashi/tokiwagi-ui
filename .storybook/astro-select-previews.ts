import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data';
import type { AstroSelectPreviews } from '../src/stories/select-preview';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);
export function astroSelectPreviewsPlugin(): Plugin {
  const dependencies = ['scripts/render-astro-select-previews.ts', 'src/astro/TSelect.astro', 'src/astro/TSelectProps.ts',
    'src/lib/select.ts', 'src/astro/TIcon.astro', 'src/astro/index.ts', 'src/stories/select-preview.ts',
  ].map(path => root + path);
  return astroPreviewDataPlugin('selects', async (): Promise<AstroSelectPreviews> => {
    const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-selects-'));
    try {
      const output = join(directory, 'previews.json');
      await execute('bun', ['scripts/render-astro-select-previews.ts', output], { cwd: root });
      return JSON.parse(await readFile(output, 'utf8'));
    } finally { await rm(directory, { recursive: true, force: true }); }
  }, dependencies);
}
