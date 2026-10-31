import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, mkdirSync, writeFileSync, rmSync, renameSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { changedPaths, checkIds, classifyPaths, planSummary, type CheckId } from './ci-changes';

const selected = (paths: string[]) => checkIds.filter(id => classifyPaths(paths)[id].run);

// スキル・一般文書は実行元から参照されないため、本文だけなら6チェックとも不要になる。
test('スキル本文と一般文書だけの変更では全チェックを省略する', () => {
  expect(selected(['.agents/skills/issue-to-pr/SKILL.md', 'README.md', 'AGENTS.md', 'CLAUDE.md', 'docs/wiki/Testing.md'])).toEqual([]);
});

// 代表的な変更ごとに依存する検証だけを選び、無関係のビルドやReact互換性を起動しない。
test('紹介ページ・各方式・テスト・画像比較設定を個別に判定する', () => {
  const cases: [string, CheckId[]][] = [
    ['src/pages/index.astro', ['typecheck', 'build']],
    ['src/react/TIcon.tsx', ['typecheck', 'tests', 'react_compat', 'storybook', 'visual']],
    ['src/vue/TIcon.ts', ['typecheck', 'tests', 'storybook', 'visual']],
    ['src/astro/TIcon.astro', ['typecheck', 'tests', 'storybook', 'visual']],
    ['src/lib/palette.test.ts', ['typecheck', 'tests']],
    ['src/react/TIcon.hydration.test.tsx', ['typecheck', 'tests', 'react_compat']],
    ['src/react/test-act.ts', ['typecheck', 'tests', 'react_compat']],
    ['src/react/TIcon.typecheck.tsx', ['typecheck', 'react_compat']],
    ['src/astro/TIcon.typecheck.ts', ['typecheck']],
    ['playwright.config.ts', ['typecheck', 'visual']],
    ['scripts/visual-transfer.ts', ['typecheck', 'tests']],
    ['src/lib/brand-test-helpers.ts', ['typecheck', 'tests', 'react_compat']],
    ['src/lib/palette.ts', ['typecheck', 'tests', 'build', 'storybook', 'visual']],
    ['src/lib/brand.ts', ['typecheck', 'tests', 'react_compat', 'storybook', 'visual']],
    ['src/styles/global.css', ['build', 'storybook', 'visual']],
    ['tokens/colors.css', ['tests', 'build', 'storybook', 'visual']],
  ];
  for (const [path, expected] of cases) expect(selected([path])).toEqual(expected);
});

// Storybookの原稿と検索に使うREADMEは一般文書から区別し、参照先の検証を省略しない。
test('表示用READMEと原本SVGは関連するビルド・テストへ含める', () => {
  expect(selected(['icons/bell/README.md'])).toEqual(['tests', 'build', 'storybook', 'visual']);
  expect(selected(['components/TIcon/README.md'])).toEqual(['tests', 'storybook', 'visual']);
  expect(selected(['icons/bell/bell.svg'])).toEqual(['tests', 'react_compat', 'build', 'storybook', 'visual']);
});

// 除外対象との混在ではコードの検証を維持し、重複するパスを理由欄へ二重に載せない。
test('複数変更の検証を合算して判定理由を保持する', () => {
  const paths = ['.agents/skills/issue-to-pr/SKILL.md', 'src/vue/TIcon.ts', 'src/pages/index.astro', 'src/vue/TIcon.ts'];
  expect(selected(paths)).toEqual(['typecheck', 'tests', 'build', 'storybook', 'visual']);
  expect(classifyPaths(paths).tests.reasons).toEqual(['src/vue/TIcon.ts']);
});

// 未分類・依存・共通設定・判定自身は安全側に倒し、スキル配下の実行コードも一括除外しない。
test('未分類のファイルやCI基盤の変更は全チェックを実行する', () => {
  for (const path of ['package.json', 'bun.lock', 'tsconfig.json', 'astro.config.mjs', '.github/workflows/ci.yml',
    'scripts/ci-changes.ts', 'scripts/ci-changes.test.ts', 'scripts/visual-run-status.ts',
    '.agents/skills/example/run.ts', 'src/new-feature.ts', 'new unknown file.txt']) {
    expect(selected([path])).toEqual([...checkIds]);
  }
});

// 手動起動・取得できない履歴は全実行へ倒すが、不正なJSONなどのプログラム異常はCLIで失敗する。
test('手動実行と比較不能では理由付きで全チェックを実行する', () => {
  for (const changes of [changedPaths('workflow_dispatch', {}, '.'), changedPaths('push', { before: '0'.repeat(40), after: 'a'.repeat(40) }, '.'),
    changedPaths('push', { before: 'a'.repeat(40), after: 'b'.repeat(40) }, '.')]) {
    expect(changes.forceReason).toBeTruthy();
    expect(checkIds.every(id => classifyPaths(changes.paths, changes.forceReason)[id].run)).toBe(true);
  }
});

// 実際のGit履歴で複数コミット・削除・改名・空白と改行を含む名前を比較し、途中の変更を落とさない。
test('push全体とPRの分岐元から追加・削除・改名されたパスを取得する', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'tkw-ci-changes-'));
  const git = (...args: string[]) => execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const write = (path: string, value = 'body') => { mkdirSync(dirname(join(cwd, path)), { recursive: true }); writeFileSync(join(cwd, path), value); };
  const commit = () => { git('add', '-A'); git('commit', '-m', 'test'); return git('rev-parse', 'HEAD'); };
  try {
    git('init', '--initial-branch=main');
    write('src/react/old name.tsx'); write('icons/bell/README.md');
    const base = commit();
    git('checkout', '-b', 'feature');
    renameSync(join(cwd, 'src/react/old name.tsx'), join(cwd, 'src/react/new\nname.tsx'));
    unlinkSync(join(cwd, 'icons/bell/README.md'));
    commit();
    write('docs/wiki/new page.md');
    const head = commit();
    const expected = ['docs/wiki/new page.md', 'icons/bell/README.md', 'src/react/new\nname.tsx', 'src/react/old name.tsx'].sort();
    expect(changedPaths('push', { before: base, after: head }, cwd).paths.sort()).toEqual(expected);
    git('checkout', 'main'); write('main-only.txt'); const updatedBase = commit();
    expect(changedPaths('pull_request', { pull_request: { base: { sha: updatedBase }, head: { sha: head } } }, cwd).paths.sort()).toEqual(expected);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});

// 任意のファイル名がActionsの表を崩したりHTMLとして解釈されたりしないよう表示時だけエスケープする。
test('判定の概要に実行・省略理由と安全なファイル名を表示する', () => {
  expect(planSummary(classifyPaths([]))).toContain('省略 | 関連する変更なし');
  expect(planSummary(classifyPaths(['<bad>|name\n.txt']))).toContain('&lt;bad&gt;&#124;name&#10;.txt');
});

// Actionsへ渡す出力の真偽値と概要を確認し、不正なイベントJSONで成功扱いにならないことを検証する。
test('CLIは6フラグを書き出しイベントの読み込み異常は失敗する', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'tkw-ci-output-'));
  const eventPath = join(cwd, 'event.json');
  const outputPath = join(cwd, 'output');
  const summaryPath = join(cwd, 'summary');
  const invoke = () => Bun.spawnSync([process.execPath, new URL('./ci-changes.ts', import.meta.url).pathname], {
    cwd, env: { ...process.env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_EVENT_PATH: eventPath, GITHUB_OUTPUT: outputPath, GITHUB_STEP_SUMMARY: summaryPath },
    stdout: 'pipe', stderr: 'pipe',
  });
  try {
    writeFileSync(eventPath, '{}');
    expect(invoke().exitCode).toBe(0);
    expect(readFileSync(outputPath, 'utf8').trim().split('\n')).toEqual(checkIds.map(id => `${id}=true`));
    expect(readFileSync(summaryPath, 'utf8')).toContain('手動実行のため全チェックを実行');
    writeFileSync(eventPath, 'invalid json');
    expect(invoke().exitCode).not.toBe(0);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
