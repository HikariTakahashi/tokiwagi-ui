import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { astroPreviewDataPlugin } from './astro-preview-data.ts';
import type { AstroIconPreviews } from '../src/stories/components/astro-preview';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);

export async function generateAstroPreviews(): Promise<AstroIconPreviews> {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-previews-'));
  const output = join(directory, 'previews.json');
  try {
    // 大きなJSONを子プロセスのstdoutへ流さず、書き込み完了後のファイルを読み込む。
    await execute('bun', ['scripts/render-astro-previews.ts', output], { cwd: root });
    return JSON.parse(await readFile(output, 'utf8'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

/** AstroのHTMLをJSONとして収録し、仮想モジュールでURLを渡す。ブラウザーへAstroランタイムを送らない。 */
export function astroPreviewsPlugin(): Plugin {
  const dependencies = [
    'scripts/render-astro-previews.ts', 'src/astro/TIcon.astro', 'src/astro/TIconProps.ts', 'src/astro/index.ts',
    'src/lib/icon-assets.ts', 'src/lib/icon-sources.ts',
    ...readdirSync(`${root}icons`).map(name => `icons/${name}/${name}.svg`),
  ].map(path => `${root}${path}`);
  return astroPreviewDataPlugin('icons', generateAstroPreviews, dependencies);
}
