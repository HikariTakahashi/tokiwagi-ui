import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

type Step = { id?: string; name?: string; if?: string; run?: string; uses?: string; with?: Record<string, unknown>; env?: Record<string, string>; 'working-directory'?: string };
type Job = { name?: string; needs?: string; if?: string; steps: Step[]; permissions?: Record<string, string>; env?: Record<string, string> };
type Event = { branches?: string[]; paths?: string[]; workflows?: string[]; types?: string[]; inputs?: Record<string, { required?: boolean; type?: string }> };
type Workflow = { on: Record<string, Event | null>; jobs: Record<string, Job>; permissions: Record<string, string>; env?: Record<string, string> };
const workflow = (name: string) => Bun.YAML.parse(readFileSync(new URL(`../.github/workflows/${name}.yml`, import.meta.url), 'utf8')) as Workflow;
// ここで使う条件式は比較・論理演算のみ。実ファイルの式を境界条件ごとに評価する。
const condition = (expression: string | undefined, needs: object, steps: object = {}, cancelled = false) => {
  if (!expression) throw new Error('実行条件がありません');
  return Boolean(new Function('needs', 'steps', 'cancelled', `return (${expression.replace(/^\$\{\{\s*|\s*\}\}$/g, '')});`)(needs, steps, () => cancelled));
};

// 必須チェック名を保ったまま、不要なら省略し、判定失敗では既存チェック自身を失敗させる。
test('6チェックは判定成功時だけ省略でき判定失敗を通過させない', () => {
  const ci = workflow('ci');
  const visual = workflow('visual');
  const jobs: Record<string, Job> = { ...ci.jobs, visual: visual.jobs.visual! };
  for (const [id, name] of Object.entries({ typecheck: 'tkw-typecheck', tests: 'tkw-tests', react_compat: 'tkw-react-compat', build: 'tkw-build', storybook: 'tkw-storybook', visual: 'tkw-visual' })) {
    const job = jobs[id]!;
    expect(job.name).toBe(name);
    expect(job.needs).toBe('changes');
    for (const result of ['success', 'failure', 'skipped', 'cancelled']) {
      for (const required of ['true', 'false']) {
        const needs = { changes: { result, outputs: { [id]: required } } };
        expect(condition(job.if, needs)).toBe(result !== 'success' || required === 'true');
        expect(condition(job.if, needs, {}, true)).toBe(false);
        expect(condition(job.steps[0]!.if, needs)).toBe(result !== 'success');
      }
    }
    expect(job.steps[0]!.run).toBe('exit 1');
  }
  for (const config of [ci, visual]) {
    for (const event of ['pull_request', 'push']) {
      expect(config.on[event]).not.toHaveProperty('paths');
      expect(config.on[event]).not.toHaveProperty('paths-ignore');
    }
  }
});

// 外部へ書き込む補助処理はmainだけで動かし、別リポジトリ・PR・作業ブランチで許可しない。
test('補助ワークフローはmainのコードを取得し実行元と権限を限定する', () => {
  const bunVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).packageManager.split('@')[1];
  for (const [name, id] of [['sync-wiki', 'sync'], ['visual-transfer', 'transfer'], ['visual-approve', 'approve']] as const) {
    const config = workflow(name);
    const job = config.jobs[id]!;
    const allowed = new Function('github', `return (${job.if});`);
    for (const repository of ['HikariTakahashi/tokiwagi-ui', 'someone/fork']) {
      for (const ref of ['refs/heads/main', 'refs/heads/feature', 'refs/pull/1/merge']) {
        expect(allowed({ repository, ref })).toBe(repository === 'HikariTakahashi/tokiwagi-ui' && ref === 'refs/heads/main');
      }
    }
    expect(config.permissions).toEqual({ contents: name === 'sync-wiki' ? 'write' : 'read' });
    expect(config.env).toBeUndefined();
    expect(job.env).toBeUndefined();
    const checkout = job.steps.find(step => step.uses?.startsWith('actions/checkout@'))!;
    expect(checkout.with).toMatchObject({ ref: 'main', 'persist-credentials': false });
    const setup = job.steps.find(step => step.uses?.startsWith('oven-sh/setup-bun@'))!;
    expect(setup.with?.['bun-version']).toBe(bunVersion);
    for (const step of job.steps.filter(step => step.uses)) expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
  }
});

// Wikiは原稿・同期処理の更新か手動操作で公開し、main取得後の検証を通してから原稿と公開先を同期する。
test('Wiki同期は対象パスと取得先を限定し同期前にテストを実行する', () => {
  const config = workflow('sync-wiki');
  expect(Object.keys(config.on).sort()).toEqual(['push', 'workflow_dispatch']);
  expect(config.on.push).toEqual({ branches: ['main'], paths: [
    'docs/wiki/**', 'scripts/sync-wiki.ts', 'scripts/sync-wiki.test.ts', '.github/workflows/sync-wiki.yml',
  ] });
  const job = config.jobs.sync!;
  const source = job.steps.findIndex(step => step.uses?.startsWith('actions/checkout@') && step.with?.path === 'source');
  const check = job.steps.findIndex(step => step.run === 'bun test scripts/sync-wiki.test.ts');
  const target = job.steps.findIndex(step => step.uses?.startsWith('actions/checkout@') && step.with?.path === 'wiki');
  const sync = job.steps.findIndex(step => step.run === 'bun source/scripts/sync-wiki.ts source/docs/wiki wiki');
  const publish = job.steps.findIndex(step => step.run?.includes('git push origin HEAD'));
  expect(source).toBeGreaterThan(-1);
  expect(check).toBeGreaterThan(source);
  expect(target).toBeGreaterThan(check);
  expect(sync).toBeGreaterThan(target);
  expect(publish).toBeGreaterThan(sync);
  expect(job.steps[check]!['working-directory']).toBe('source');
  expect(job.steps[target]!.with?.repository).toBe('${{ github.repository }}.wiki');
  expect(job.steps[publish]!['working-directory']).toBe('wiki');
  expect(job.steps[publish]!.run).toContain('git diff --cached --quiet');
  for (const step of [job.steps[check]!, job.steps[sync]!, job.steps[publish]!]) expect(step.if).toBeUndefined();
  expect(job.steps.filter(step => step.env?.VISUAL_STORAGE_TOKEN)).toHaveLength(0);
});

// 完了したVisual Testsだけを転送し、同じ実行IDと処理結果を通知まで引き渡し、保管用Secretは転送に限定する。
test('レポート転送は対象実行と引数・通知・Secretの受け渡しを維持する', () => {
  const config = workflow('visual-transfer');
  expect(Object.keys(config.on).sort()).toEqual(['workflow_dispatch', 'workflow_run']);
  expect(config.on.workflow_run).toEqual({ workflows: ['Visual Tests'], types: ['completed'] });
  expect(config.on.workflow_dispatch?.inputs?.run_id).toMatchObject({ required: true, type: 'string' });
  const job = config.jobs.transfer!;
  expect(job.permissions).toEqual({ contents: 'read', actions: 'read', 'pull-requests': 'write' });
  const status = job.steps.find(step => step.id === 'status')!;
  const transfer = job.steps.find(step => step.id === 'transfer')!;
  const comment = job.steps.find(step => step.run?.includes('scripts/visual-comment.ts'))!;
  expect(status.run).toBe('bun scripts/visual-run-status.ts "$SOURCE_RUN"');
  expect(transfer.run).toBe('bun run visual:transfer "$SOURCE_RUN"');
  expect(comment.run).toBe('bun scripts/visual-comment.ts "$SOURCE_RUN"');
  for (const step of [status, transfer, comment]) {
    expect(step.env?.SOURCE_RUN).toBe('${{ github.event.workflow_run.id || inputs.run_id }}');
    expect(step.env?.GH_TOKEN).toBe('${{ github.token }}');
  }
  expect(job.steps.filter(step => step.env?.VISUAL_STORAGE_TOKEN)).toEqual([transfer]);
  expect(transfer.env?.VISUAL_STORAGE_TOKEN).toBe('${{ secrets.VISUAL_STORAGE_TOKEN }}');
  expect(comment.env?.REPORT_TRANSFER_OUTCOME).toBe('${{ steps.transfer.outcome }}');
  expect(condition(comment.if, {}, { status: { outputs: { skipped: 'false' } } }, true)).toBe(false);
});

// 基準承認は必須の候補実行IDを手動指定し、生成元を検証するコマンドにだけ保管用Secretを渡す。
test('基準画像承認は手動操作と生成元検証付きの切り替えだけを許可する', () => {
  const config = workflow('visual-approve');
  expect(Object.keys(config.on)).toEqual(['workflow_dispatch']);
  expect(config.on.workflow_dispatch?.inputs?.run_id).toMatchObject({ required: true, type: 'string' });
  const job = config.jobs.approve!;
  expect(job.permissions).toEqual({ actions: 'read', contents: 'read' });
  const install = job.steps.findIndex(step => step.run === 'bun install --frozen-lockfile');
  const promote = job.steps.findIndex(step => step.run === 'bun scripts/visual-storage.ts promote-run "$SOURCE_RUN"');
  expect(install).toBeGreaterThan(-1);
  expect(promote).toBeGreaterThan(install);
  expect(job.steps[promote]!.env).toEqual({
    GH_TOKEN: '${{ github.token }}', VISUAL_STORAGE_TOKEN: '${{ secrets.VISUAL_STORAGE_TOKEN }}', SOURCE_RUN: '${{ inputs.run_id }}',
  });
  expect(job.steps[promote]!.if).toBeUndefined();
  expect(job.steps.filter(step => step.env?.VISUAL_STORAGE_TOKEN)).toEqual([job.steps[promote]!]);
});

// 画像比較の省略では依存導入・外部転送・コメントのすべてを止め、実行失敗時のコメント条件は残す。
test('画像比較省略の条件が転送と通知の全ステップを停止する', () => {
  const steps = workflow('visual-transfer').jobs.transfer!.steps;
  const probe = steps.findIndex(step => step.id === 'status');
  const install = steps.findIndex(step => step.run === 'bun install --frozen-lockfile');
  expect(probe).toBeGreaterThan(-1);
  expect(install).toBeGreaterThan(probe);
  const downstream = steps.slice(install);
  expect(downstream).toHaveLength(3);
  for (const step of downstream) {
    expect(condition(step.if, {}, { status: { outputs: { skipped: 'true' } } })).toBe(false);
    expect(condition(step.if, {}, { status: { outputs: { skipped: 'false' } } })).toBe(true);
  }
  const comment = downstream[2]!;
  expect(comment.if).toContain('!cancelled()');
  expect(comment.if).not.toContain('success()');
});
