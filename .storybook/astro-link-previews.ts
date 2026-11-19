import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data';
import type { AstroLinkPreviews } from '../src/stories/link-preview';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);

export function astroLinkPreviewsPlugin(): Plugin {
  const dependencies = ['scripts/render-astro-link-previews.ts', 'src/astro/TLink.astro',
    'src/astro/TLinkProps.ts', 'src/lib/link.ts', 'src/lib/link-size.ts', 'src/astro/TIcon.astro', 'src/astro/index.ts',
  ].map(path => root + path);
  return astroPreviewDataPlugin('links', async (): Promise<AstroLinkPreviews> => {
    const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-links-'));
    try {
      const output = join(directory, 'previews.json');
      await execute('bun', ['scripts/render-astro-link-previews.ts', output], { cwd: root });
      return JSON.parse(await readFile(output, 'utf8'));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, dependencies);
}
