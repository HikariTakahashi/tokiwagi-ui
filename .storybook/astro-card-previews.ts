import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data';
import type { AstroCardPreviews } from '../src/stories/card-preview';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);
export function astroCardPreviewsPlugin(): Plugin {
  const parts = ['TCard', 'TCardHeader', 'TCardTitle', 'TCardDescription', 'TCardBody', 'TCardFooter', 'TCardMedia', 'TCardActionArea'];
  const dependencies = ['scripts/render-astro-card-previews.ts', 'src/lib/card.ts', 'src/astro/index.ts',
    'src/stories/card-preview.ts', 'src/stories/components/CardExample.astro',
    ...parts.flatMap(name => [`src/astro/${name}.astro`, `src/astro/${name}Props.ts`]),
  ].map(path => root + path);
  return astroPreviewDataPlugin('cards', async (): Promise<AstroCardPreviews> => {
    const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-cards-'));
    try {
      const output = join(directory, 'previews.json');
      await execute('bun', ['scripts/render-astro-card-previews.ts', output], { cwd: root });
      return JSON.parse(await readFile(output, 'utf8'));
    } finally { await rm(directory, { recursive: true, force: true }); }
  }, dependencies);
}
