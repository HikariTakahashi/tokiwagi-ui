import { expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { initializeSectionNavigation } from './section-navigation';

function createPage(scroll = 0) {
  const window = new Window({ url: 'https://example.test/' });
  const document = window.document;
  window.innerHeight = 600;
  document.body.innerHTML = `
    <nav data-section-navigation>
      <a href="#principles">デザインの考え方</a>
      <a href="#foundations">基盤</a>
      <a href="https://example.test/storybook" target="_blank">Storybook</a>
    </nav>
    <main>
      <section id="top"></section>
      <section id="principles"></section>
      <section id="foundations"></section>
      <section></section>
    </main>`;
  const boundaries = [[0, 700], [700, 1300], [1300, 2100], [2100, 2500]];
  [...document.querySelectorAll('section')].forEach((section, index) => {
    const [top, bottom] = boundaries[index]!;
    section.getBoundingClientRect = () => new window.DOMRect(0, top! - scroll, 1000, bottom! - top!);
  });
  const links = [...document.querySelectorAll('nav a')];
  const current = () => links.filter(link => link.hasAttribute('data-active')).map(link => link.getAttribute('href'));
  initializeSectionNavigation(document as unknown as Document, window as unknown as globalThis.Window);
  return { window, links, current, setScroll: (value: number) => { scroll = value; } };
}

// 通常スクロールで2つの現在地が排他的に切り替わり、Hero・末尾では下線と読み上げ状態を解除する。
test('LPのセクション移動に合わせてactiveとaria-currentを切り替える', async () => {
  const page = createPage();
  try {
    expect(page.current()).toEqual([]);
    for (const [scroll, expected] of [[600, '#principles'], [1200, '#foundations'], [1950, null], [0, null]] as const) {
      page.setScroll(scroll);
      page.window.dispatchEvent(new page.window.Event('scroll'));
      await page.window.happyDOM.waitUntilComplete();
      expect(page.current()).toEqual(expected ? [expected] : []);
      for (const link of page.links) {
        expect(link.getAttribute('aria-current')).toBe(link.getAttribute('href') === expected ? 'location' : null);
      }
    }
    expect(page.links[2]!.getAttribute('target')).toBe('_blank');
  } finally { await page.window.happyDOM.close(); }
});

// ページ途中での再読み込みでも、スクロールイベントを待たず現在地を反映する。
test('LPの初期表示で現在のセクションを反映する', async () => {
  const page = createPage(1200);
  try {
    expect(page.current()).toEqual(['#foundations']);
    expect(page.links[1]!.getAttribute('aria-current')).toBe('location');
  } finally { await page.window.happyDOM.close(); }
});

// 画面サイズ変更や履歴からの復元、フラグメント移動でも表示位置を再判定する。
test('LPのサイズ変更・履歴復元・ページ内リンクの移動に追従する', async () => {
  const page = createPage(450);
  try {
    expect(page.current()).toEqual([]);
    page.window.innerHeight = 900;
    page.window.dispatchEvent(new page.window.Event('resize'));
    await page.window.happyDOM.waitUntilComplete();
    expect(page.current()).toEqual(['#principles']);
    page.setScroll(1200);
    page.window.dispatchEvent(new page.window.Event('pageshow'));
    await page.window.happyDOM.waitUntilComplete();
    expect(page.current()).toEqual(['#foundations']);
    page.setScroll(0);
    page.window.dispatchEvent(new page.window.Event('hashchange'));
    await page.window.happyDOM.waitUntilComplete();
    expect(page.current()).toEqual([]);
  } finally { await page.window.happyDOM.close(); }
});
