import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { createIconCatalog, isBrandAssetName, type IconSearchEntry } from '../src/lib/icon-assets';

const iconsDirectory = fileURLToPath(new URL('../icons/', import.meta.url));

/** 原本との照合と別名の抽出はNode側で行い、README本文とSVGをブラウザーへ送らない。 */
export function generateIconSearchIndex(directory = iconsDirectory): IconSearchEntry[] {
  const sources: Record<string, string> = {};
  const documents: Record<string, string> = {};
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || isBrandAssetName(entry.name)) continue;
    for (const file of readdirSync(join(directory, entry.name))) {
      const path = `${entry.name}/${file}`;
      if (file.endsWith('.svg')) sources[path] = readFileSync(join(directory, path), 'utf8');
      if (file === 'README.md') documents[path] = readFileSync(join(directory, path), 'utf8');
    }
  }
  return createIconCatalog(sources, documents).map(({ svg, ...entry }) => entry);
}

export function iconSearchIndexPlugin(): Plugin {
  const virtualId = 'virtual:tkw-icon-search-index';
  const resolvedId = `\0${virtualId}`;
  return {
    name: 'vite-plugin-tkw-icon-search-index',
    resolveId(id) { if (id === virtualId) return resolvedId; },
    load(id) {
      if (id !== resolvedId) return;
      for (const entry of readdirSync(iconsDirectory, { withFileTypes: true })) {
        if (!entry.isDirectory() || isBrandAssetName(entry.name)) continue;
        const directory = join(iconsDirectory, entry.name);
        for (const file of readdirSync(directory)) this.addWatchFile(join(directory, file));
      }
      return `export default ${JSON.stringify(generateIconSearchIndex())};`;
    },
    configureServer(server) {
      server.watcher.add(iconsDirectory);
      const refresh = (file: string) => {
        if (!file.startsWith(iconsDirectory) || !/(?:\/README\.md|\.svg)$/.test(file)) return;
        const module = server.moduleGraph.getModuleById(resolvedId);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      };
      // 別名の編集に加えて原本の追加・削除も反映し、別の辞書や生成コマンドを不要にする。
      for (const event of ['add', 'change', 'unlink'] as const) server.watcher.on(event, refresh);
      server.httpServer?.once('close', () => {
        for (const event of ['add', 'change', 'unlink'] as const) server.watcher.off(event, refresh);
      });
    },
  };
}
