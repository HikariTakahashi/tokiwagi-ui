import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import type { AstroIconPreviews } from '../src/stories/components/astro-preview';

const root = fileURLToPath(new URL('../', import.meta.url));
const virtualId = 'virtual:tkw-astro-icons';
const resolvedId = `\0${virtualId}`;
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

/** AstroのHTMLを開発・静的ビルドで共通の仮想モジュールにする。ブラウザーへAstroランタイムを送らない。 */
export function astroPreviewsPlugin(): Plugin {
  let pending: Promise<AstroIconPreviews> | undefined;
  const dependencies = [
    'scripts/render-astro-previews.ts', 'src/astro/TIcon.astro', 'src/astro/TIconProps.ts', 'src/astro/index.ts',
    'src/lib/icon-assets.ts', 'src/lib/icon-sources.ts',
    ...readdirSync(`${root}icons`).map(name => `icons/${name}/${name}.svg`),
  ].map(path => `${root}${path}`);
  return {
    name: 'vite-plugin-tkw-astro-previews',
    resolveId(id) { if (id === virtualId) return resolvedId; },
    async load(id) {
      if (id !== resolvedId) return;
      for (const file of dependencies) this.addWatchFile(file);
      pending ??= generateAstroPreviews().catch(error => { pending = undefined; throw error; });
      return `export default ${JSON.stringify(await pending)};`;
    },
    handleHotUpdate(context) {
      if (!dependencies.includes(context.file)) return;
      pending = undefined;
      const module = context.server.moduleGraph.getModuleById(resolvedId);
      if (module) context.server.moduleGraph.invalidateModule(module);
      // ブラウザー側の読み込み済みHTMLも破棄し、原本・実コンポーネントの変更を反映する。
      context.server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
