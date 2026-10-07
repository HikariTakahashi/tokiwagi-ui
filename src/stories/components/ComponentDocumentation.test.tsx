import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { act, type ReactNode } from 'react';
import { CodeBlock, AstroPreviewStatus, useAstroPreviews, componentExample, type Framework } from './ComponentDocumentation';

let window: Window;
let createRoot: typeof import('react-dom/client')['createRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(async () => {
  window = new Window();
  for (const [key, value] of Object.entries({ window, document: window.document, navigator: window.navigator,
    HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ createRoot } = await import('react-dom/client'));
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

async function mount(element: ReactNode) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => { root.render(element); });
  return {
    host,
    render: async (next: ReactNode) => { await act(async () => { root.render(next); }); },
    close: async () => { await act(async () => root.unmount()); host.remove(); },
  };
}

// 現在のコードをコピーし成功を通知する。設定変更後は古い通知を消して更新後のコードをコピーする。
test('コードのコピー成功とコード変更後の通知リセットを確認できる', async () => {
  const write = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  const view = await mount(<CodeBlock code="初期コード" />);
  try {
    await act(async () => view.host.querySelector('button')!.click());
    expect(write).toHaveBeenLastCalledWith('初期コード');
    expect(view.host.querySelector('[role=status]')!.textContent).toBe('コードをコピーしました。');
    await view.render(<CodeBlock code="更新コード" />);
    expect(view.host.querySelector('[role=status]')!.textContent).toBe('');
    expect(view.host.querySelector('code')!.textContent).toBe('更新コード');
    await act(async () => view.host.querySelector('button')!.click());
    expect(write).toHaveBeenLastCalledWith('更新コード');
  } finally { await view.close(); write.mockRestore(); }
});

// クリップボード拒否時もコードを読める状態を保ち、選択コピーへ誘導する。
test('コピー失敗時は手動コピーを案内してコードを維持する', async () => {
  const write = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('拒否'));
  const view = await mount(<CodeBlock code="手動コピー用コード" />);
  try {
    await act(async () => view.host.querySelector('button')!.click());
    expect(view.host.querySelector('[role=status]')!.textContent).toBe('コピーできませんでした。コードを選択してコピーしてください。');
    expect(view.host.querySelector('pre')!.tabIndex).toBe(0);
    expect(view.host.querySelector('code')!.textContent).toBe('手動コピー用コード');
  } finally { await view.close(); write.mockRestore(); }
});

// コピー完了前に設定を変更した場合、遅れて完了した旧コードの成功通知を現在のコードに表示しない。
test('コード変更後に古いコピー処理が完了しても通知を表示しない', async () => {
  let finish!: () => void;
  const write = spyOn(navigator.clipboard, 'writeText').mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const view = await mount(<CodeBlock code="旧コード" />);
  try {
    await act(async () => view.host.querySelector('button')!.click());
    await view.render(<CodeBlock code="新コード" />);
    await act(async () => finish());
    expect(view.host.querySelector('[role=status]')!.textContent).toBe('');
  } finally { await view.close(); write.mockRestore(); }
});

function AstroHarness({ framework, load }: { framework: Framework; load: () => Promise<string> }) {
  const { previews, error, retry } = useAstroPreviews(framework, load);
  return <><AstroPreviewStatus framework={framework} ready={previews !== null} error={error} retry={retry} /><output>{previews}</output></>;
}

// Astro選択時だけ読み込み、失敗を通知する。再試行で見本が復旧し、戻っても読み込み済みデータを利用する。
test('Astroプレビューの読み込み失敗から再試行で復旧できる', async () => {
  let calls = 0;
  let reject!: (reason: Error) => void;
  let resolve!: (value: string) => void;
  const load = () => {
    calls++;
    return new Promise<string>((ok, fail) => { resolve = ok; reject = fail; });
  };
  const view = await mount(<AstroHarness framework="react" load={load} />);
  try {
    expect(calls).toBe(0);
    await view.render(<AstroHarness framework="astro" load={load} />);
    expect(view.host.querySelector('[role=status]')!.textContent).toContain('読み込んでいます');
    await act(async () => reject(new Error('読み込み失敗')));
    expect(view.host.querySelector('[role=alert]')!.textContent).toContain('読み込めませんでした');
    await act(async () => view.host.querySelector('button')!.click());
    expect(calls).toBe(2);
    expect(view.host.querySelector('[role=alert]')).toBeNull();
    await act(async () => resolve('復旧した見本'));
    expect(view.host.querySelector('output')!.textContent).toBe('復旧した見本');
    expect(view.host.querySelector('[role=status]')).toBeNull();
    await view.render(<AstroHarness framework="vue" load={load} />);
    await view.render(<AstroHarness framework="astro" load={load} />);
    expect(calls).toBe(2);
  } finally { await view.close(); }
});

// 読み込み中にReactへ切り替えた場合、旧リクエストの失敗をReact画面へ表示しない。再選択時に正常復旧する。
test('方式の切り替え後に古いAstroリクエストが失敗しても画面へ残らない', async () => {
  let reject!: (reason: Error) => void;
  let calls = 0;
  const load = () => ++calls === 1
    ? new Promise<string>((_, fail) => { reject = fail; })
    : Promise.resolve('再選択した見本');
  const view = await mount(<AstroHarness framework="astro" load={load} />);
  try {
    await view.render(<AstroHarness framework="react" load={load} />);
    await act(async () => reject(new Error('旧リクエスト')));
    expect(view.host.querySelector('[role=alert]')).toBeNull();
    await view.render(<AstroHarness framework="astro" load={load} />);
    expect(view.host.querySelector('output')!.textContent).toBe('再選択した見本');
  } finally { await view.close(); }
});

// 各方式で必要なファイル構文を出力し、トークンimportと指定した見本のpropsをそのまま保つ。
test('使用コードはReact・Vue・Astroのファイル構文と選択設定を含む', () => {
  const body = '<TLogo size={64} decorative />';
  const react = componentExample('react', 'TLogo', body, ['neutrals']);
  expect(react).toContain("from 'tokiwagi-ui/react'");
  expect(react).toContain('export function Example()');
  expect(react).toContain(body);
  const vue = componentExample('vue', 'TLogo', '<TLogo :size="64" decorative />', ['neutrals']);
  expect(vue).toContain('<script setup lang="ts">');
  expect(vue).toContain('<template>');
  expect(vue).toContain(':size="64" decorative');
  const astro = componentExample('astro', 'TLogo', body, ['neutrals']);
  expect(astro.startsWith('---\n')).toBe(true);
  expect(astro).toContain(`\n---\n${body}`);
  for (const code of [react, vue, astro]) expect(code).toContain("import 'tokiwagi-ui/tokens/neutrals.css';");
});
