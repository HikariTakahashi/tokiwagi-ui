import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data.ts';
import type { AstroHeaderPreviews } from '../src/stories/header-preview';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);
async function generate(): Promise<AstroHeaderPreviews> {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-headers-'));
  try {
    const output = join(directory, 'previews.json');
    await execute('bun', ['scripts/render-astro-header-previews.ts', output], { cwd: root });
    return JSON.parse(await readFile(output, 'utf8'));
  } finally { await rm(directory, { recursive: true, force: true }); }
}
export function astroHeaderPreviewsPlugin(): Plugin {
  const dependencies = ['scripts/render-astro-header-previews.ts', 'src/stories/fixtures/HeaderPreview.astro',
    'src/stories/header-preview.ts', 'src/lib/header.ts', 'src/lib/icon-sources.ts', 'src/lib/icon-assets.ts',
    'src/astro/index.ts', 'src/astro/TIcon.astro', 'src/astro/TIconProps.ts',
    ...['THeader', 'THeaderButton', 'THeaderButtonGroup', 'THeaderSection'].flatMap(name => [`src/astro/${name}.astro`, `src/astro/${name}Props.ts`]),
    ...['menu', 'dashboard', 'chevron-bottom', 'edit', 'calendar-check', 'share', 'chevron-left', 'chevron-right'].map(name => `icons/${name}/${name}.svg`),
  ].map(path => root + path);
  return astroPreviewDataPlugin('headers', generate, dependencies);
}
