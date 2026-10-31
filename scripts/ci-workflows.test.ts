import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

type Step = { id?: string; name?: string; if?: string; run?: string };
type Job = { name: string; needs?: string; if?: string; steps: Step[] };
type Workflow = { on: Record<string, Record<string, unknown>>; jobs: Record<string, Job> };
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
