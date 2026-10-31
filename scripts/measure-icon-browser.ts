import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

/** ビルド済みの一覧Docsから静的importだけを辿る。動的な個別Docs・使用例とSVGは初期JSへ含めない。 */
const directory = resolve(process.argv[2] ?? 'storybook-static/assets');
const entries = readdirSync(directory).filter(name => /^icons-[\w-]+\.js$/.test(name));
if (entries.length !== 1) throw new Error('一覧Docsのチャンクを特定できません。bun run build:storybookを実行してください。');
const scanner = new Bun.Transpiler({ loader: 'js' });
const files = new Map<string, { bytes: number; gzip: number }>();
function visit(file: string) {
  if (files.has(file)) return;
  const source = readFileSync(file, 'utf8');
  files.set(file, { bytes: Buffer.byteLength(source), gzip: gzipSync(source).length });
  for (const dependency of scanner.scanImports(source)) {
    if (dependency.kind === 'import-statement' && dependency.path.startsWith('.')) {
      visit(resolve(dirname(file), dependency.path));
    }
  }
}
const entry = resolve(directory, entries[0]!);
visit(entry);
console.log(JSON.stringify({
  entry: entries[0],
  entrySize: files.get(entry),
  staticImportCount: files.size,
  total: [...files.values()].reduce((sum, file) => ({ bytes: sum.bytes + file.bytes, gzip: sum.gzip + file.gzip }), { bytes: 0, gzip: 0 }),
  readmeChunks: [...files.keys()].filter(file => /\/README-/.test(file)).length,
}, null, 2));
