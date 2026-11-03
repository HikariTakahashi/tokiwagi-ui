import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Vitest 4.1.12のGCを実際の起動設定で検証する。更新時は内部参照と環境変数を確認する。
const cli = readFileSync(new URL('../node_modules/vitest/dist/chunks/cli-api.B0Pz1_R7.js', import.meta.url), 'utf8');
const source = cli.slice(cli.indexOf('const chromiumGCDiskThreshold ='), cli.indexOf('\nfunction createMethodsRPC(', cli.indexOf('const chromiumGCDiskThreshold =')));
const script = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).scripts.storybook as string;
const threshold = script.match(/(?:^|\s)VITEST_CHROMIUM_GC_DISK_THRESHOLD_GB=([^\s]+)/)?.[1];

async function collect(platform: string) {
  const operations: string[] = [];
  const collectGarbage = runInNewContext(`${source}\nmaybeCollectChromiumGarbage;`, {
    process: { platform, env: { VITEST_CHROMIUM_GC_DISK_THRESHOLD_GB: threshold } },
    createDebugger: () => undefined, performance,
    // ディスクに余裕があっても、ファイル間でブラウザのメモリを回収する。
    statfsSync: () => ({ bavail: 200 * 1024 ** 3, bsize: 1 }),
  });
  await collectGarbage({
    config: { browser: { name: 'chromium', isolate: true } },
    browser: { provider: { name: 'playwright', getCDPSession: async () => ({
      send: async (command: string) => { operations.push(command); },
      detach: async () => { operations.push('detach'); },
    }) } },
  }, 'session');
  return operations;
}

// ディスク空き200GiBのLinuxでも、ファイル間GCとCDPセッションの解放が行われることを確認する。
test('StorybookのLinuxテストは空きディスク容量に関係なくファイル間でGCする', async () => {
  expect(await collect('linux')).toEqual(['HeapProfiler.collectGarbage', 'detach']);
});

// 同じ起動設定をmacOSで読み込んでも、Linux向けの追加GCが実行されないことを確認する。
test('StorybookのmacOSテストにはLinux向けのGCを追加しない', async () => {
  expect(await collect('darwin')).toEqual([]);
});
