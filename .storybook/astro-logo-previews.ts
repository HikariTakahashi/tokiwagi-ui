import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data.ts';
import type { AstroLogoPreviews } from '../src/stories/astro-logo-previews';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);

async function generate(): Promise<AstroLogoPreviews> {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-logos-'));
  const output = join(directory, 'previews.json');
  try {
    await execute('bun', ['scripts/render-astro-logo-previews.ts', output], { cwd: root });
    return JSON.parse(await readFile(output, 'utf8'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

/** Astroの実コンポーネントを静的HTMLにし、開発中も原本・API変更を反映する。 */
export function astroLogoPreviewsPlugin(): Plugin {
  const dependencies = ['scripts/render-astro-logo-previews.ts', 'src/astro/TLogo.astro',
    'src/astro/TLogoProps.ts', 'src/astro/index.ts', 'src/lib/logo.ts', 'icons/logo/logo.svg'].map(path => root + path);
  return astroPreviewDataPlugin('logos', generate, dependencies);
}
