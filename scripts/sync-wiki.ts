import { lstatSync, readFileSync, readdirSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

export const manifestName = '.wiki-sync-manifest';

function assertPageName(name: unknown): asserts name is string {
  if (typeof name !== 'string' || !name.endsWith('.md') || name.startsWith('.') ||
      /[\\/:*?"<>|\x00-\x1f\x7f]/.test(name) || name === '.md') {
    throw new Error(`Wikiページ名が不正です: ${JSON.stringify(name)}`);
  }
}

function readRegularFile(path: string): Buffer | undefined {
  const stat = lstatSync(path, { throwIfNoEntry: false });
  if (!stat) return undefined;
  if (!stat.isFile()) throw new Error(`通常ファイル以外は同期できません: ${path}`);
  return readFileSync(path);
}

// 全入力を検証・読み込みしてから書き換え、管理一覧にあるページだけ削除する。
export function syncWiki(sourceDirectory: string, wikiDirectory: string): string[] {
  const source = realpathSync(sourceDirectory);
  const wiki = realpathSync(wikiDirectory);
  if (source === wiki || source.startsWith(wiki + sep) || wiki.startsWith(source + sep)) {
    throw new Error('原稿とWikiは独立したディレクトリを指定してください');
  }

  const pages = readdirSync(source).filter(name => name.endsWith('.md')).sort();
  if (!pages.length) throw new Error('Wiki原稿が空です');
  if (!pages.includes('Home.md')) throw new Error('Wiki原稿にHome.mdが必要です');
  const contents = new Map<string, Buffer>();
  for (const page of pages) {
    assertPageName(page);
    contents.set(page, readRegularFile(join(source, page))!);
  }

  const previousManifest = readRegularFile(join(wiki, manifestName));
  let previousPages: string[] = [];
  if (previousManifest) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(previousManifest.toString('utf8'));
    } catch {
      throw new Error('Wiki管理一覧が有効なJSONではありません');
    }
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1 ||
        !('pages' in parsed) || !Array.isArray(parsed.pages) || !parsed.pages.includes('Home.md')) {
      throw new Error('Wiki管理一覧の形式が不正です');
    }
    for (const page of parsed.pages) assertPageName(page);
    previousPages = parsed.pages;
    if (new Set(previousPages).size !== previousPages.length) throw new Error('Wiki管理一覧に重複があります');
  }

  const existing = new Map<string, Buffer | undefined>();
  for (const page of new Set([...pages, ...previousPages])) {
    existing.set(page, readRegularFile(join(wiki, page)));
  }
  const removed = previousPages.filter(page => !contents.has(page) && existing.get(page));
  const updated = pages.filter(page => !existing.get(page)?.equals(contents.get(page)!));
  const nextManifest = Buffer.from(JSON.stringify({ version: 1, pages }, null, 2) + '\n');
  const manifestChanged = !previousManifest?.equals(nextManifest);

  for (const page of updated) writeFileSync(join(wiki, page), contents.get(page)!);
  for (const page of removed) unlinkSync(join(wiki, page));
  if (manifestChanged) writeFileSync(join(wiki, manifestName), nextManifest);
  return [...updated, ...removed, ...(manifestChanged ? [manifestName] : [])];
}

function git(directory: string, args: string[]): string {
  const result = Bun.spawnSync(['git', '-C', directory, ...args], { stdout: 'pipe', stderr: 'pipe' });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString().trim() || 'Git操作に失敗しました');
  return result.stdout.toString().trim();
}

if (import.meta.main) {
  try {
    const [source, wiki, ...extra] = Bun.argv.slice(2);
    if (!source || !wiki || extra.length) throw new Error('使い方: bun scripts/sync-wiki.ts <原稿ディレクトリ> <Wikiディレクトリ>');
    if (realpathSync(git(wiki, ['rev-parse', '--show-toplevel'])) !== realpathSync(resolve(wiki))) {
      throw new Error('Wikiリポジトリのルートを指定してください');
    }
    if (git(wiki, ['status', '--porcelain', '--untracked-files=all'])) throw new Error('Wikiの作業ツリーに既存の変更があります');
    const changed = syncWiki(source, wiki);
    if (changed.length) git(wiki, ['add', '--all', '--', ...changed.map(name => `:(literal)${name}`)]);
    console.log(changed.length ? `Wiki同期: ${changed.join(', ')}` : 'Wiki同期: 差分なし');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
