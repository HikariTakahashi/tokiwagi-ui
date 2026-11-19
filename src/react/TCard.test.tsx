import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test';
import { Window } from 'happy-dom';
import { useId } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { TCard, TCardHeader, TCardTitle, TCardDescription, TCardBody, TCardFooter, TCardMedia, TCardActionArea,
  type TCardProps, type TCardTitleProps } from 'tokiwagi-ui/react';
import { invalidCardOptions } from '../lib/card-test-helpers';
import { act } from './test-act';
import 'tokiwagi-ui/card.css';

let window: Window;
let hydrateRoot: typeof import('react-dom/client')['hydrateRoot'];
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeAll(async () => {
  window = new Window();
  for (const [key, value] of Object.entries({ window, document: window.document, navigator: window.navigator,
    HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ hydrateRoot } = await import('react-dom/client'));
});
afterAll(async () => {
  await window.happyDOM.close();
  for (const [key, descriptor] of globals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  }
});

// 公開入口の全パーツを組み合わせ、指定した要素・属性・内容・画像の意味が出力されることを確認する。
test('ReactのTCardは全パーツとネイティブ属性を保持する', () => {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<TCard as="article" variant="subtle" size="sm" className="custom"
    aria-labelledby="example-title" aria-busy="true" data-example="card" style={{ maxWidth: 414 }}>
    <TCardMedia className="cover"><img src="/cover.png" loading="lazy" alt="カードの設計図" /></TCardMedia>
    <TCardHeader title="見出し"><TCardTitle as="h2" id="example-title">設計</TCardTitle><TCardDescription>補足</TCardDescription></TCardHeader>
    <TCardBody>{'<script>実行しない</script>'}<strong>重要</strong></TCardBody>
    <TCardFooter><button type="button">保存</button><a href="/details">詳細</a></TCardFooter>
  </TCard>);
  const card = host.firstElementChild as HTMLElement;
  expect(card.tagName).toBe('ARTICLE'); expect(card.className).toBe('tkw-card custom');
  expect(card.dataset.variant).toBe('subtle'); expect(card.dataset.size).toBe('sm');
  expect(card.getAttribute('aria-busy')).toBe('true'); expect(card.getAttribute('aria-labelledby')).toBe('example-title');
  expect(card.style.maxWidth).toBe('414px'); expect(card.querySelector('h2')?.id).toBe('example-title');
  expect(card.querySelector('.tkw-card-media img')?.getAttribute('alt')).toBe('カードの設計図');
  expect(card.querySelector('.tkw-card-header')?.getAttribute('title')).toBe('見出し');
  expect(card.querySelector('.tkw-card-description')?.tagName).toBe('P');
  expect(card.querySelector('.tkw-card-body strong')?.textContent).toBe('重要');
  expect(card.querySelector('.tkw-card-footer button')?.textContent).toBe('保存');
  expect(card.querySelector('script')).toBeNull(); expect(card.textContent).toContain('<script>実行しない</script>');
  expect(renderToStaticMarkup(<TCard><TCardBody /></TCard>)).toContain('data-variant="outline" data-size="md"');
  for (const [key, value] of invalidCardOptions)
    expect(() => renderToStaticMarkup(<TCard {...{ [key]: value } as TCardProps} />)).toThrow(key);
  expect(() => renderToStaticMarkup(<TCardTitle as={'div' as TCardTitleProps['as']} />)).toThrow('as');
  expect(() => renderToStaticMarkup(<TCardActionArea href="  " />)).toThrow('href');
});

// 2つの親が付けたIDをSSRとhydrateで維持し、属性・文言・ネイティブイベントとリンクの安全性を更新する。
test('ReactのTCardは複数表示を警告なくhydrateし、設定と操作を更新する', async () => {
  const clicked: EventTarget[] = [];
  function Example({ updated = false }: { updated?: boolean }) {
    const titleId = useId();
    return <TCard as="article" variant={updated ? 'elevated' : 'outline'} size={updated ? 'lg' : 'md'} aria-labelledby={titleId}>
      <TCardActionArea href={updated ? '/new' : '/guide'} target="_blank" rel="external opener" onClick={event => { event.preventDefault(); clicked.push(event.currentTarget); }}>
        <TCardHeader><TCardTitle id={titleId}>{updated ? '更新' : '導入'}</TCardTitle></TCardHeader>
        <TCardBody data-content="body">本文</TCardBody>
      </TCardActionArea>
    </TCard>;
  }
  const page = (updated = false) => <><Example updated={updated} /><Example /></>;
  const host = document.createElement('div'); host.innerHTML = renderToString(page()); document.body.append(host);
  const card = host.firstElementChild as HTMLElement; const link = card.querySelector('a')!;
  const ids = [...host.querySelectorAll('h3')].map(node => node.id);
  expect(new Set(ids).size).toBe(2);
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  const recovered: unknown[] = []; let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => { root = hydrateRoot(host, page(), { onRecoverableError: error => recovered.push(error) }); });
    await act(async () => { link.click(); }); expect(clicked).toEqual([link]);
    await act(async () => { root!.render(page(true)); });
    expect(host.firstElementChild).toBe(card); expect(card.dataset.variant).toBe('elevated'); expect(card.dataset.size).toBe('lg');
    expect(link.getAttribute('href')).toBe('/new'); expect(link.rel).toBe('external noopener');
    expect(card.querySelector('h3')?.id).toBe(ids[0]); expect(card.querySelector('h3')?.textContent).toBe('更新');
    expect(recovered).toEqual([]); expect(errors).not.toHaveBeenCalled();
  } finally { if (root) await act(async () => { root!.unmount(); }); errors.mockRestore(); host.remove(); }
});
