import { expect, test } from 'bun:test';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// 固定バージョンの実際のIPCブリッジを、子プロセスとストアだけ差し替えて検証する。
// Storybook更新時はBunパッチとともにこの抽出範囲も確認する。
const preset = readFileSync(new URL('../node_modules/@storybook/addon-vitest/dist/preset.js', import.meta.url), 'utf8');
const bridge = preset.slice(preset.lastIndexOf('// src/node/boot-test-runner.ts'), preset.indexOf('// src/node/test-run-responder.ts'));
const names = ['UNIVERSAL_STORE:storybook/test', 'UNIVERSAL_STORE:status', 'UNIVERSAL_STORE:test-provider'];

async function setupBridge() {
  const sent: unknown[] = [];
  const received: unknown[] = [];
  const listeners = new Map<string, ((event: unknown, info: unknown) => void)[]>();
  const stores = names.map(name => ({
    send(event: { payload: { error: unknown } }) { throw event.payload.error; },
    subscribe(typeOrListener: string | ((event: unknown, info: unknown) => void)) {
      if (typeof typeOrListener === 'function') listeners.set(name, [typeOrListener]);
      return () => {};
    },
  }));
  const child = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(), stderr: new EventEmitter(),
    send: (message: unknown) => sent.push(message), kill: () => {},
  });
  const channel = {
    emit(type: string, ...args: { event: unknown; eventInfo: unknown }[]) {
      received.push({ type, args });
      for (const listener of listeners.get(type) ?? []) listener(args[0].event, args[0].eventInfo);
    },
  };
  const boot = runInNewContext(`${bridge}\nbootTestRunner;`, {
    fileURLToPath2: (value: string) => value, importMetaResolve: (value: string) => value,
    executeNodeCommand: () => child, process: { env: {}, on: () => {}, exit: () => {} },
    normalize: (value: string) => value, errorToErrorLike: (error: unknown) => error,
    setTimeout: () => 0, log: () => {},
    internal_universalStatusStore: stores[1], internal_universalTestProviderStore: stores[2],
    STORE_CHANNEL_EVENT_NAME: names[0], STATUS_STORE_CHANNEL_EVENT_NAME: names[1],
    TEST_PROVIDER_STORE_CHANNEL_EVENT_NAME: names[2],
  });
  const ready = boot({ channel, store: stores[0], options: { configDir: '.storybook' } });
  child.emit('message', { type: 'ready' });
  await ready;
  return { child, sent, received, listeners };
}

// 子由来の3ストア通知を受信し、画面へ届けたうえで子への返送が0件になることを確認する。
test('Vitestの各ストア通知を画面へ届け、同じ子プロセスへ返送しない', async () => {
  const { child, sent, received } = await setupBridge();
  for (const type of names) {
    child.emit('message', {
      type, args: [{ event: { type: '__SET_STATE', payload: { state: { success: 347 } } }, eventInfo: { actor: { id: 'vitest', environment: 'SERVER' } } }],
    });
  }
  expect(received).toHaveLength(3);
  expect(sent).toHaveLength(0);
});

// 子由来通知の識別後も、画面の操作要求と親が新しく作った同期応答が転送されることを確認する。
test('画面からの実行要求と親ストアの同期応答はVitestへ転送する', async () => {
  const { child, sent, listeners } = await setupBridge();
  const event = { type: '__SET_STATE', payload: { state: { coverage: true, a11y: true } } };
  child.emit('message', { type: names[0], args: [{ event, eventInfo: { actor: { id: 'vitest', environment: 'SERVER' } } }] });
  sent.length = 0;
  const requests = [
    { type: 'TRIGGER_RUN' },
    { type: '__EXISTING_STATE_RESPONSE', payload: { coverage: true, a11y: true } },
    { ...event },
  ];
  for (const request of requests) listeners.get(names[0])![0](request, { actor: { id: 'parent' } });
  expect(sent).toHaveLength(3);
  expect(sent).toEqual(requests.map(event => ({ type: names[0], args: [{ event, eventInfo: { actor: { id: 'parent' } } }], from: 'server' })));
});
