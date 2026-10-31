import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

export const checkIds = ['typecheck', 'tests', 'react_compat', 'build', 'storybook', 'visual'] as const;
export type CheckId = typeof checkIds[number];
export type CheckPlan = Record<CheckId, { run: boolean; reasons: string[] }>;
const story: CheckId[] = ['storybook', 'visual'];
const component: CheckId[] = ['typecheck', 'tests', ...story];
const reactLibraries = new Set(['icon-assets', 'icon-sources', 'icon-search-labels', 'logo', 'brand']);
const pageLibraries = new Set(['palette', 'icon-catalog', 'icon-assets', 'icon-search-labels']);
const reactHelpers = new Set(['brand-test-helpers', 'logo-test-helpers']);

// 未分類は全検証へ倒す。Markdownの除外は表示・テスト用原稿と分けて限定する。
function checksFor(path: string): CheckId[] {
  if (path.startsWith('.github/workflows/') || /^scripts\/(ci-changes|visual-run-status)(\.|\/)/.test(path)) return [...checkIds];
  if (/^(README|AGENTS|CLAUDE)\.md$/.test(path) || /^docs\/.+\.md$/.test(path) || /^\.agents\/skills\/.+\.md$/.test(path)) return [];
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(path) && /^(src|scripts|\.storybook)\//.test(path)) {
    return path.startsWith('src/react/') ? ['typecheck', 'tests', 'react_compat'] : ['typecheck', 'tests'];
  }
  if (/\.typecheck\.[jt]sx?$/.test(path) && path.startsWith('src/')) {
    return path.startsWith('src/react/') ? ['typecheck', 'react_compat'] : ['typecheck'];
  }
  if (path === 'src/react/test-act.ts') return ['typecheck', 'tests', 'react_compat'];
  if (/^src\/pages\/.+\.astro$/.test(path)) return ['typecheck', 'build'];
  if (/^src\/react\/.+\.tsx?$/.test(path)) return [...component, 'react_compat'];
  if (/^src\/(vue|astro)\/.+\.(ts|vue|astro)$/.test(path)) return component;
  if (/^src\/lib\/[^/]+\.ts$/.test(path)) {
    const name = path.slice('src/lib/'.length, -3);
    if (reactHelpers.has(name)) return ['typecheck', 'tests', 'react_compat'];
    if (!reactLibraries.has(name) && !pageLibraries.has(name)) return [...checkIds];
    return [...component, ...(reactLibraries.has(name) ? ['react_compat' as const] : []), ...(pageLibraries.has(name) ? ['build' as const] : [])];
  }
  if (/^src\/stories\/.+\.(ts|tsx|mdx|css)$/.test(path)) return [...(/\.tsx?$/.test(path) ? ['typecheck' as const] : []), 'tests', ...story];
  if (/^src\/icons\/[^/]+\.mdx$/.test(path) || /^components\/[^/]+\/README\.md$/.test(path)) return ['tests', ...story];
  if (/^icons\/[^/]+\/[^/]+\.svg$/.test(path)) return ['tests', 'react_compat', 'build', ...story];
  if (/^icons\/[^/]+\/README\.md$/.test(path)) return ['tests', 'build', ...story];
  if (/^tokens\/[^/]+\.css$/.test(path)) return ['tests', 'build', ...story];
  if (path === 'src/styles/global.css') return ['build', ...story];
  if (path === 'src/styles/storybook.css') return story;
  if (/^\.storybook\/.+\.ts$/.test(path)) return component;
  if (/^scripts\/render-astro(?:-logo|-brand)?-previews\.ts$/.test(path)) return component;
  if (path === 'scripts/check-react-compat.ts') return ['typecheck', 'tests', 'react_compat'];
  if (/^scripts\/(generate-icons|icon-story-generation|sync-wiki|visual-transfer|visual-comment)\.ts$/.test(path)) return ['typecheck', 'tests'];
  if (/^scripts\/(run-visual|visual-storage|visual-report)\.ts$/.test(path)) return ['typecheck', 'tests', 'visual'];
  if (path === 'playwright.config.ts' || /^e2e\/.+\.visual\.ts$/.test(path)) return ['typecheck', 'visual'];
  return [...checkIds];
}

export function classifyPaths(paths: readonly string[], forceReason?: string): CheckPlan {
  const plan = Object.fromEntries(checkIds.map(id => [id, { run: false, reasons: [] as string[] }])) as CheckPlan;
  if (forceReason) {
    for (const id of checkIds) plan[id] = { run: true, reasons: [forceReason] };
    return plan;
  }
  for (const path of new Set(paths)) {
    for (const id of checksFor(path)) {
      plan[id].run = true;
      plan[id].reasons.push(path);
    }
  }
  return plan;
}

type Event = { before?: string; after?: string; pull_request?: { base: { sha: string }; head: { sha: string } } };
export function changedPaths(eventName: string, event: Event, cwd: string): { paths: string[]; forceReason?: string } {
  if (eventName === 'workflow_dispatch') return { paths: [], forceReason: '手動実行のため全チェックを実行' };
  let base = eventName === 'pull_request' ? event.pull_request?.base.sha : event.before;
  const head = eventName === 'pull_request' ? event.pull_request?.head.sha : event.after;
  if (!['pull_request', 'push'].includes(eventName) || !base || !head ||
      ![base, head].every(sha => /^[a-f0-9]{40}$/.test(sha) && !/^0+$/.test(sha))) {
    return { paths: [], forceReason: '比較対象を取得できないため全チェックを実行' };
  }
  const git = (args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    if (eventName === 'pull_request') base = git(['merge-base', base, head]).trim();
    // NUL区切りで空白・改行を保持し、改名は削除＋追加として旧名・新名の両方を検証する。
    const paths = git(['diff', '--name-only', '--no-renames', '-z', base, head, '--']).split('\0').filter(Boolean);
    return { paths };
  } catch {
    return { paths: [], forceReason: 'Gitの比較に必要な履歴を取得できないため全チェックを実行' };
  }
}

export function planSummary(plan: CheckPlan) {
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '&#124;').replaceAll('\n', '&#10;').replaceAll('\r', '&#13;');
  return '## 変更内容に応じたチェック判定\n\n| チェック | 判定 | 理由・変更ファイル |\n| --- | --- | --- |\n' +
    checkIds.map(id => `| tkw-${id.replaceAll('_', '-')} | ${plan[id].run ? '実行' : '省略'} | ${plan[id].reasons.map(reason => `<code>${escape(reason)}</code>`).join('<br>') || '関連する変更なし'} |`).join('\n') + '\n';
}

if (import.meta.main) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8')) as Event;
  const changes = changedPaths(process.env.GITHUB_EVENT_NAME!, event, process.cwd());
  const plan = classifyPaths(changes.paths, changes.forceReason);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, checkIds.map(id => `${id}=${plan[id].run}`).join('\n') + '\n');
  const summary = planSummary(plan);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
}
