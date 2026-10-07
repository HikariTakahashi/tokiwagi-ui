import type { Plugin } from 'vite';

/** 生成済みHTMLをJSONとして配信する。ES moduleの失敗キャッシュに依存せずfetchで再試行できる。 */
export function astroPreviewDataPlugin<T>(name: string, generate: () => Promise<T>, dependencies: readonly string[]): Plugin {
  const virtualId = `virtual:tkw-astro-${name}`;
  const resolvedId = `\0${virtualId}`;
  const endpoint = `/@tkw/astro-${name}.json`;
  let build = false;
  let pending: Promise<T> | undefined;
  const data = () => pending ??= generate().catch(error => { pending = undefined; throw error; });
  return {
    name: `vite-plugin-tkw-astro-${name}-previews`,
    configResolved(config) { build = config.command === 'build'; },
    resolveId(id) { if (id === virtualId) return resolvedId; },
    async load(id) {
      if (id !== resolvedId) return;
      for (const file of dependencies) this.addWatchFile(file);
      if (!build) return `export default ${JSON.stringify(endpoint)};`;
      const reference = this.emitFile({ type: 'asset', name: `tkw-astro-${name}.json`, source: JSON.stringify(await data()) });
      return `export default import.meta.ROLLUP_FILE_URL_${reference};`;
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split('?')[0] !== endpoint) return next();
        data().then(value => {
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          response.end(JSON.stringify(value));
        }).catch(error => {
          server.config.logger.error(String(error));
          response.statusCode = 503;
          response.end('Astro preview generation failed');
        });
      });
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
