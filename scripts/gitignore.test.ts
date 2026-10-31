import { expect, test } from 'bun:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function ignoredPaths(paths: string[]): string[] {
  const cwd = mkdtempSync(join(tmpdir(), 'tkw-gitignore-'));
  try {
    execFileSync('git', ['init', '--quiet', '--template=', cwd], { stdio: 'pipe' });
    writeFileSync(join(cwd, '.gitignore'), readFileSync(new URL('../.gitignore', import.meta.url)));
    const result = spawnSync('git', ['-c', 'core.excludesFile=/dev/null', 'check-ignore', '--no-index', '-z', '--stdin'], {
      cwd, input: paths.join('\0') + '\0', encoding: 'utf8',
    });
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || 'Gitの除外判定に失敗しました');
    return result.stdout.split('\0').filter(Boolean);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

// 実際のGit判定で生成物・依存・環境ファイルを調べ、成果物や秘密情報を管理対象へ混入させない。
test('生成物と環境ファイルはGitの管理対象から除外する', () => {
  const paths = [
    'node_modules/example/index.js', 'dist/index.html', 'storybook-static/index.html',
    'playwright-report/index.html', 'test-results/report.json', '.visual-baselines/baseline.png',
    '.visual-candidates/baselines.zip', '.visual-site/gallery.html', 'e2e/icons-snapshots/current.png',
    'debug-storybook.log', '.astro/types.d.ts', '.DS_Store', '.env', '.env.local', '.env.production',
  ];
  expect(ignoredPaths(paths)).toEqual(paths);
});

// 管理すべきコード・テスト・設定・原稿と.env.exampleは、除外パターンを変更してもGitへ登録できる。
test('ソースとテストと設定と環境変数の見本を誤って除外しない', () => {
  expect(ignoredPaths([
    '.env.example', '.gitignore', 'package.json', 'bun.lock', 'package-lock.json', 'tsconfig.json',
    'astro.config.mjs', 'playwright.config.ts', '.github/workflows/ci.yml',
    '.github/workflows/visual.yml', '.github/workflows/sync-wiki.yml',
    '.github/workflows/visual-transfer.yml', '.github/workflows/visual-approve.yml',
    '.agents/skills/issue-to-pr/agents/openai.yaml', '.vscode/settings.json', '.devcontainer/Dockerfile',
    'src/react/TIcon.tsx', 'src/vue/TIcon.ts', 'src/astro/TIcon.astro', 'src/pages/index.astro',
    'src/lib/palette.test.ts', 'src/stories/TIcon.stories.ts', 'src/icons/bell.mdx',
    'scripts/ci-changes.ts', 'scripts/ci-changes.test.ts', 'scripts/gitignore.test.ts', 'e2e/icons.visual.ts',
    '.storybook/main.ts', 'tokens/colors.css', 'icons/bell/bell.svg', 'icons/bell/README.md',
    'components/TIcon/README.md', 'docs/wiki/Testing.md', 'LICENSE', 'LICENSE-SCOPE.md',
  ])).toEqual([]);
});
