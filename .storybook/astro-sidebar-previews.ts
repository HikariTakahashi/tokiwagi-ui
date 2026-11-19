import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data';
import type { AstroSidebarPreviews } from '../src/stories/sidebar-preview';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);
export function astroSidebarPreviewsPlugin(): Plugin {
  const parts = ['TSidebarLayout', 'TSidebar', 'TSidebarMain', 'TSidebarHeader', 'TSidebarBody', 'TSidebarFooter'];
  const dependencies = ['scripts/render-astro-sidebar-previews.ts', 'src/lib/sidebar.ts', 'src/astro/index.ts',
    'src/stories/sidebar-preview.ts', 'src/stories/components/SidebarExample.astro',
    ...parts.flatMap(name => [`src/astro/${name}.astro`, `src/astro/${name}Props.ts`]),
  ].map(path => root + path);
  return astroPreviewDataPlugin('sidebars', async (): Promise<AstroSidebarPreviews> => {
    const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-sidebars-'));
    try {
      const output = join(directory, 'previews.json');
      await execute('bun', ['scripts/render-astro-sidebar-previews.ts', output], { cwd: root });
      return JSON.parse(await readFile(output, 'utf8'));
    } finally { await rm(directory, { recursive: true, force: true }); }
  }, dependencies);
}
