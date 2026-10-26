import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { manifestName } from './sync-wiki';

const script = fileURLToPath(new URL('./sync-wiki.ts', import.meta.url));
let root: string;
let source: string;
let wiki: string;

function git(...args: string[]): string {
  const result = Bun.spawnSync(['git', '-C', wiki, ...args], { stdout: 'pipe', stderr: 'pipe' });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString().trim();
}

function commit() {
  git('-c', 'user.name=Wiki Test', '-c', 'user.email=wiki-test@example.invalid', 'commit', '-m', 'test');
}

function sync() {
  return Bun.spawnSync([process.execPath, script, source, wiki], { stdout: 'pipe', stderr: 'pipe' });
}

function syncAndCommit() {
  const result = sync();
  expect(result.stderr.toString()).toBe('');
  expect(result.exitCode).toBe(0);
  commit();
}

function expectUnchangedFailure(message: string) {
  const before = git('status', '--porcelain', '--untracked-files=all');
  const home = readFileSync(join(wiki, 'Home.md'), 'utf8');
  const result = sync();
  expect(result.exitCode).toBe(1);
  expect(result.stderr.toString()).toContain(message);
  expect(git('status', '--porcelain', '--untracked-files=all')).toBe(before);
  expect(readFileSync(join(wiki, 'Home.md'), 'utf8')).toBe(home);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'tokiwagi-wiki-test-'));
  source = join(root, 'source');
  wiki = join(root, 'wiki');
  mkdirSync(source);
  mkdirSync(wiki);
  git('init', '--initial-branch=master');
  writeFileSync(join(source, 'Home.md'), '# 新しいHome\r\n');
  writeFileSync(join(source, '_Sidebar.md'), '- [Home](Home)\n');
  writeFileSync(join(wiki, 'Home.md'), '# 既存Home\n');
  writeFileSync(join(wiki, 'Independent.md'), '# 独自ページ\n');
  mkdirSync(join(wiki, 'images'));
  writeFileSync(join(wiki, 'images', 'sample.png'), Buffer.from([0, 1, 2, 255]));
  git('add', '--all');
  commit();
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('Wiki原稿の同期', () => {
  // 初回に同名原稿を反映して管理一覧を登録し、独自ページ・画像・既存履歴を保持する。
  test('初回同期で原稿とサイドバーを登録し対象外の資産と履歴を保持する', () => {
    syncAndCommit();
    expect(readFileSync(join(wiki, 'Home.md'))).toEqual(readFileSync(join(source, 'Home.md')));
    expect(readFileSync(join(wiki, '_Sidebar.md'), 'utf8')).toBe('- [Home](Home)\n');
    expect(JSON.parse(readFileSync(join(wiki, manifestName), 'utf8'))).toEqual({ version: 1, pages: ['Home.md', '_Sidebar.md'] });
    expect(readFileSync(join(wiki, 'Independent.md'), 'utf8')).toBe('# 独自ページ\n');
    expect(readFileSync(join(wiki, 'images', 'sample.png'))).toEqual(Buffer.from([0, 1, 2, 255]));
    expect(git('rev-list', '--count', 'HEAD')).toBe('2');
  });

  // 2回目以降は追加・更新・削除・改名を反映し、削除済み原稿を管理一覧から外す。
  test('管理対象の追加・更新・削除・名前変更を同期する', () => {
    writeFileSync(join(source, 'Usage.md'), '# 使い方\n');
    writeFileSync(join(source, 'Old.md'), '# 古いページ\n');
    syncAndCommit();
    writeFileSync(join(source, 'Home.md'), '# 更新したHome\n');
    writeFileSync(join(source, 'New.md'), '# 新規ページ\n');
    renameSync(join(source, 'Usage.md'), join(source, 'Guide.md'));
    unlinkSync(join(source, 'Old.md'));
    syncAndCommit();
    expect(readFileSync(join(wiki, 'Home.md'), 'utf8')).toBe('# 更新したHome\n');
    expect(git('ls-files').split('\n').sort()).toEqual([manifestName, 'Guide.md', 'Home.md', 'Independent.md', 'New.md', '_Sidebar.md', 'images/sample.png'].sort());
    expect(JSON.parse(readFileSync(join(wiki, manifestName), 'utf8')).pages).toEqual(['Guide.md', 'Home.md', 'New.md', '_Sidebar.md']);
  });

  // 同じ原稿を再同期した場合はステージ済み・未追跡の差分が発生せず、追加コミットが不要になる。
  test('差分なしの再実行は正常終了する', () => {
    syncAndCommit();
    const head = git('rev-parse', 'HEAD');
    const result = sync();
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain('差分なし');
    expect(git('status', '--porcelain')).toBe('');
    expect(git('rev-parse', 'HEAD')).toBe(head);
  });

  // 管理ページのWiki直接編集は原稿へ戻し、すでにWiki側で削除された旧ページも正常に処理する。
  test('管理ページの直接編集と削除があっても原稿へ一致させる', () => {
    writeFileSync(join(source, 'Old.md'), '# 旧ページ\n');
    syncAndCommit();
    writeFileSync(join(wiki, 'Home.md'), '# Wikiの直接編集\n');
    unlinkSync(join(wiki, 'Old.md'));
    git('add', '--all');
    commit();
    unlinkSync(join(source, 'Old.md'));
    syncAndCommit();
    expect(readFileSync(join(wiki, 'Home.md'))).toEqual(readFileSync(join(source, 'Home.md')));
    expect(JSON.parse(readFileSync(join(wiki, manifestName), 'utf8')).pages).not.toContain('Old.md');
  });

  // Gitのパス指定に解釈されやすい角括弧と空白を含むページも、対象のファイルだけ追加・削除する。
  test('空白と角括弧を含むページ名を正確にステージする', () => {
    writeFileSync(join(source, 'Guide [v1].md'), '# 案内\n');
    syncAndCommit();
    expect(git('ls-files')).toContain('Guide [v1].md');
    unlinkSync(join(source, 'Guide [v1].md'));
    syncAndCommit();
    expect(git('ls-files')).not.toContain('Guide [v1].md');
  });

  // 対象外形式とサブディレクトリの資料は公開せず、直下のMarkdownだけを同期する。
  test('原稿直下のMarkdownだけを公開対象にする', () => {
    writeFileSync(join(source, 'notes.txt'), '内部メモ');
    mkdirSync(join(source, 'drafts'));
    writeFileSync(join(source, 'drafts', 'Draft.md'), '# 下書き\n');
    syncAndCommit();
    expect(git('ls-files')).not.toContain('notes.txt');
    expect(git('ls-files')).not.toContain('Draft.md');
  });
});

describe('不正入力による同期の停止', () => {
  // 空の原稿ディレクトリから実行しても、公開済みHomeや管理対象外ページを削除しない。
  test('空の原稿ではWikiを変更しない', () => {
    unlinkSync(join(source, 'Home.md'));
    unlinkSync(join(source, '_Sidebar.md'));
    expectUnchangedFailure('Wiki原稿が空');
  });

  // Homeを誤って削除した原稿では、残りの原稿や管理一覧を反映する前に停止する。
  test('Homeが欠落した原稿ではWikiを変更しない', () => {
    unlinkSync(join(source, 'Home.md'));
    expectUnchangedFailure('Home.mdが必要');
  });

  // 不正JSON、形式、重複、ディレクトリ外のパスを含む管理一覧は、原稿のコピー前に拒否する。
  test.each([
    ['JSON破損', '{', '有効なJSON'],
    ['形式不正', JSON.stringify({ version: 2, pages: ['Home.md'] }), '形式が不正'],
    ['Home欠落', JSON.stringify({ version: 1, pages: [] }), '形式が不正'],
    ['重複', JSON.stringify({ version: 1, pages: ['Home.md', 'Home.md'] }), '重複'],
    ['パストラバーサル', JSON.stringify({ version: 1, pages: ['Home.md', '../outside.md'] }), 'ページ名が不正'],
    ['文字列以外', JSON.stringify({ version: 1, pages: ['Home.md', 1] }), 'ページ名が不正'],
  ])('管理一覧の%sを拒否する', (_name, content, message) => {
    writeFileSync(join(wiki, manifestName), content);
    git('add', manifestName);
    commit();
    expectUnchangedFailure(message!);
  });

  // 管理一覧と原稿・更新先・削除対象がシンボリックリンクの場合、外部ファイルへ書き込まず停止する。
  test.each(['管理一覧', '原稿', '更新先', '削除対象'])('%sのシンボリックリンクを拒否する', target => {
    const outside = join(root, 'outside.md');
    writeFileSync(outside, '# 外部ファイル\n');
    if (target === '管理一覧') symlinkSync(outside, join(wiki, manifestName));
    if (target === '原稿') symlinkSync(outside, join(source, 'Usage.md'));
    if (target === '更新先') symlinkSync(outside, join(wiki, '_Sidebar.md'));
    if (target === '削除対象') {
      symlinkSync(outside, join(wiki, 'Old.md'));
      writeFileSync(join(wiki, manifestName), JSON.stringify({ version: 1, pages: ['Home.md', 'Old.md'] }));
    }
    if (target !== '原稿') {
      git('add', '--all');
      commit();
    }
    expectUnchangedFailure('通常ファイル以外');
    expect(readFileSync(outside, 'utf8')).toBe('# 外部ファイル\n');
  });

  // 既存のWiki作業ツリーに未コミットの編集があれば、同期に混ぜず元の内容を保つ。
  test('Wikiに既存の変更がある場合は同期しない', () => {
    writeFileSync(join(wiki, 'Independent.md'), '# 作業中\n');
    expectUnchangedFailure('既存の変更');
    expect(readFileSync(join(wiki, 'Independent.md'), 'utf8')).toBe('# 作業中\n');
  });

  // 原稿と更新先の取り違えによる原本変更を防ぐため、同一ディレクトリを拒否する。
  test('原稿とWikiの同一ディレクトリを拒否する', () => {
    const result = Bun.spawnSync([process.execPath, script, wiki, wiki], { stdout: 'pipe', stderr: 'pipe' });
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain('独立したディレクトリ');
    expect(git('status', '--porcelain')).toBe('');
  });
});
