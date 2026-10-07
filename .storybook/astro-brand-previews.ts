import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import type { AstroBrandPreviews } from '../src/stories/astro-brand-previews';

const root = fileURLToPath(new URL('../', import.meta.url));
const virtualId = 'virtual:tkw-astro-brands';
const resolvedId = '\0' + virtualId;
const execute = promisify(execFile);

async function generate(): Promise<AstroBrandPreviews> {
  const directory = await mkdtemp(join(tmpdir(), 'tkw-astro-brands-'));
  const output = join(directory, 'previews.json');
  try {
    await execute('bun', ['scripts/render-astro-brand-previews.ts', output], { cwd: root });
    return JSON.parse(await readFile(output, 'utf8'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

/** Astroの実ブランドコンポーネントを静的HTMLにし、開発中も原本・API変更を反映する。 */
export function astroBrandPreviewsPlugin(): Plugin {
  let pending: Promise<AstroBrandPreviews> | undefined;
  const dependencies = ['scripts/render-astro-brand-previews.ts', 'src/astro/TBrand.astro',
    'src/astro/TBrandProps.ts', 'src/astro/TLogo.astro', 'src/astro/TLogoProps.ts', 'src/lib/brand.ts', 'src/astro/index.ts', 'src/lib/logo.ts', 'icons/logo/logo.svg'].map(path => root + path);
  return {
    name: 'vite-plugin-tkw-astro-brand-previews',
    resolveId(id) { if (id === virtualId) return resolvedId; },
    async load(id) {
      if (id !== resolvedId) return;
      for (const file of dependencies) this.addWatchFile(file);
      pending ??= generate().catch(error => { pending = undefined; throw error; });
      return `export default ${JSON.stringify(await pending)};`;
    },
    handleHotUpdate(context) {
      if (!dependencies.includes(context.file)) return;
      pending = undefined;
      const module = context.server.moduleGraph.getModuleById(resolvedId);
      if (module) context.server.moduleGraph.invalidateModule(module);
      context.server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
