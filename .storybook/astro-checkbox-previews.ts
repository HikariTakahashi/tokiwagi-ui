import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);

export function astroCheckboxPreviewsPlugin(): Plugin {
  const dependencies = [
    'scripts/render-astro-checkbox-previews.ts', 'src/astro/TCheckbox.astro', 'src/astro/TCheckboxProps.ts',
    'src/astro/index.ts', 'src/lib/checkbox.ts',
  ].map(path => join(root, path));
  return astroPreviewDataPlugin('checkboxes', async (): Promise<string> => {
    const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-checkboxes-'));
    try {
      const output = join(directory, 'previews.json');
      await execute('bun', ['scripts/render-astro-checkbox-previews.ts', output], { cwd: root });
      return JSON.parse(await readFile(output, 'utf8'));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, dependencies);
}
