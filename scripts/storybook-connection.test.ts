import { expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Storybook 10.6.0に適用したパッチの実ファイルを、実行環境と同じNodeで検証する。
// Storybook更新時はパッチとともにこの参照先も確認する。
function runConnectionTest(body: string) {
  const result = spawnSync('node', ['--input-type=module', '--eval', `
    import assert from 'node:assert/strict';
    import { mock } from 'node:test';
    mock.timers.enable({ apis: ['setTimeout'] });
    try { ${body} } finally { mock.timers.reset(); }
  `], { cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8' });
  if (result.error) throw result.error;
  expect(result.status, result.stdout + result.stderr).toBe(0);
}

// 初期状態が1.5秒後に届く状況でも同期に成功し、Coverage・a11yの設定を変更できることを確認する。
test('Storybookの状態同期が1秒を超えても設定を変更できる', () => {
  runConnectionTest(`
    const { UniversalStore } = await import('./node_modules/storybook/dist/_node-chunks/chunk-HFXQZX54.js');
    const listeners = new Map();
    const channel = { on: (name, listener) => listeners.set(name, listener), emit: () => {} };
    UniversalStore.__prepare(channel, UniversalStore.Environment.MANAGER);
    const store = UniversalStore.create({ id: 'storybook/test', initialState: { coverage: false, a11y: false } });
    const ready = store.untilReady();
    ready.catch(() => {});
    mock.timers.tick(1500);
    assert.equal(store.status, UniversalStore.Status.SYNCING);
    listeners.get('UNIVERSAL_STORE:storybook/test')({
      event: { type: '__EXISTING_STATE_RESPONSE', payload: { coverage: true, a11y: false } },
      eventInfo: { actor: { id: 'server', type: 'LEADER', environment: 'SERVER' } },
    });
    await ready;
    store.setState(state => ({ ...state, a11y: true }));
    assert.deepEqual(store.getState(), { coverage: true, a11y: true });
  `);
});
