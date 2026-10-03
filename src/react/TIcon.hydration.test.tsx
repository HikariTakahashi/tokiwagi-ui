import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { TIcon } from 'tokiwagi-ui/react';
import { iconSizes } from '../lib/icon-assets';

let window: Window;
let hydrateRoot: typeof import('react-dom/client')['hydrateRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();

beforeAll(async () => {
  window = new Window();
  const values = {
    window, document: window.document, navigator: window.navigator,
    HTMLElement: window.HTMLElement, SVGElement: window.SVGElement, Node: window.Node,
    MutationObserver: window.MutationObserver, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const [key, value] of Object.entries(values)) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ hydrateRoot } = await import('react-dom/client'));
});

afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

function Page({ color = 'currentColor' }: { color?: string }) {
  return <div>{(['moon', 'tool'] as const).flatMap(name => iconSizes.map(size =>
    <TIcon key={`${name}-${size}`} name={name} size={size} color={color} />
  ))}</div>;
}

function assertLocalReferences(container: HTMLElement) {
  const ids = [...container.querySelectorAll('[id]')].map(node => node.id);
  expect(new Set(ids).size).toBe(8);
  for (const svg of container.querySelectorAll('svg')) {
    const id = svg.querySelector('[id]')!.id;
    expect(svg.innerHTML).toContain(`url(#${id})`);
  }
  return ids;
}

// 実際のSSR HTMLをhydrateRootに渡し、DOMを作り直さずID・参照を保持し、更新後もIDが変わらない。
test('ハイドレーションとprops更新でIDが一致し、警告や復旧エラーが起きない', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const html = renderToString(<Page />, { identifierPrefix: '画面:一' });
  container.innerHTML = html;
  const parsedHtml = container.innerHTML;
  const originalSvg = container.querySelector('svg');
  const ids = assertLocalReferences(container);
  const recovered: unknown[] = [];
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <Page />, {
        identifierPrefix: '画面:一', onRecoverableError: error => recovered.push(error),
      });
    });
    expect(container.innerHTML).toBe(parsedHtml);
    expect(container.querySelector('svg')).toBe(originalSvg);
    expect(assertLocalReferences(container)).toEqual(ids);
    await act(async () => { root!.render(<Page color="var(--tkw-color-primary-blue-on-subtle)" />); });
    expect(assertLocalReferences(container)).toEqual(ids);
    expect(container.querySelector('svg')!.style.color).toBe('var(--tkw-color-primary-blue-on-subtle)');
    expect(recovered).toHaveLength(0);
    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => { root!.unmount(); });
    errors.mockRestore();
    warnings.mockRestore();
    container.remove();
  }
});

// 同一文書の複数rootを別々のidentifierPrefixでSSR・hydrateし、16個すべてのIDを分離する。
test('複数のReact rootでID接頭辞を分け、ハイドレーション後も衝突しない', async () => {
  const roots: ReturnType<typeof hydrateRoot>[] = [];
  const containers: HTMLElement[] = [];
  const recovered: unknown[] = [];
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const warnings = spyOn(console, 'warn').mockImplementation(() => {});
  try {
    for (const identifierPrefix of ['first', 'second']) {
      const container = document.createElement('div');
      containers.push(container);
      document.body.append(container);
      const html = renderToString(<Page />, { identifierPrefix });
      container.innerHTML = html;
      const parsedHtml = container.innerHTML;
      await act(async () => {
        roots.push(hydrateRoot(container, <Page />, {
          identifierPrefix, onRecoverableError: error => recovered.push(error),
        }));
      });
      expect(container.innerHTML).toBe(parsedHtml);
    }
    const ids = containers.flatMap(assertLocalReferences);
    expect(new Set(ids).size).toBe(16);
    expect(recovered).toHaveLength(0);
    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
  } finally {
    await act(async () => { roots.forEach(root => root.unmount()); });
    errors.mockRestore();
    warnings.mockRestore();
    containers.forEach(container => container.remove());
  }
});
