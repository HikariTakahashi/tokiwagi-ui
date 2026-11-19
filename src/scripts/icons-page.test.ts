import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Window, type HTMLElement, type HTMLAnchorElement, type HTMLButtonElement, type HTMLInputElement, type HTMLSelectElement } from 'happy-dom';
import { iconCategories, renderIconSvg } from '../lib/icon-assets';
import { initializeIconCatalog } from './icons-page';

function createPage(query = '') {
  const window = new Window({ url: `https://example.test/icons/${query}` });
  const document = window.document;
  const fixtures = [
    ['bell', 'basic', '通知'], ['bell-off', 'basic', '通知停止'],
    ['calendar-bell', 'calendar', '予定の通知'], ['moon', 'basic', '月'],
  ];
  document.body.innerHTML = `<main data-icon-catalog>
    <div data-icon-controls hidden>${[['all', 'すべて'], ...iconCategories].map(([key, label]) => `<button data-icon-category="${key}">${label}</button>`).join('')}</div>
    <input data-icon-search><select data-icon-size>${[16, 20, 24, 32].map(size => `<option value="${size}">${size}</option>`).join('')}</select>
    <h2 data-icon-category-title></h2><p data-icon-count></p>
    <ul>${fixtures.map(([name, category, description]) => `<li data-icon-entry data-name="${name}" data-category="${category}" data-description="${description}" data-search-labels='${JSON.stringify([description])}'>
      <a data-icon-card href="https://storybook.test/?path=/docs/icons-${name}--docs" target="_blank"><span class="icons-glyph">${renderIconSvg(readFileSync(new URL(`../../icons/${name}/${name}.svg`, import.meta.url), 'utf8'), `fixture-${name}`, 24)}</span>${name}</a></li>`).join('')}</ul>
    <div data-icon-empty hidden><button data-icon-reset>解除</button></div>
    <dialog data-icon-dialog><div data-icon-detail-preview></div><h2 data-icon-detail-name></h2><p data-icon-detail-description></p><p data-icon-detail-status></p><a data-icon-detail-link></a></dialog>
  </main>`;
  const dialog = document.querySelector('dialog')!;
  // フォーカストラップ等は実ブラウザーで確認し、ここでは詳細の内容とID分離を検証する。
  dialog.showModal = () => dialog.setAttribute('open', '');
  initializeIconCatalog(document as unknown as Document, window as unknown as globalThis.Window);
  const visible = () => [...document.querySelectorAll<HTMLElement>('[data-icon-entry]')].filter(entry => !entry.hidden).map(entry => entry.dataset.name);
  const search = document.querySelector<HTMLInputElement>('[data-icon-search]')!;
  return { window, document, dialog, search, visible };
}

// 別名検索と分類はAND条件で絞り込み、ゼロ件から解除しても選択したサイズを保持する。
test('検索・分類・結果なしと解除が同じ一覧へ反映される', async () => {
  const p = createPage();
  try {
    const select = p.document.querySelector<HTMLSelectElement>('[data-icon-size]')!;
    select.value = '32'; select.dispatchEvent(new p.window.Event('change'));
    p.search.value = '通知'; p.search.dispatchEvent(new p.window.Event('input'));
    expect(p.visible()).toEqual(['bell', 'bell-off', 'calendar-bell']);
    p.document.querySelector<HTMLButtonElement>('[data-icon-category="calendar"]')!.click();
    expect(p.visible()).toEqual(['calendar-bell']);
    p.search.value = '該当なし'; p.search.dispatchEvent(new p.window.Event('input'));
    expect(p.visible()).toEqual([]);
    expect(p.document.querySelector<HTMLElement>('[data-icon-empty]')!.hidden).toBe(false);
    p.document.querySelector<HTMLButtonElement>('[data-icon-reset]')!.click();
    expect(p.visible()).toHaveLength(4);
    expect(p.document.activeElement).toBe(p.search);
    expect(p.document.querySelector('[data-icon-count]')!.textContent).toBe('4 / 4件');
    expect(p.document.querySelector('svg')!.getAttribute('width')).toBe('32');
  } finally { await p.window.happyDOM.close(); }
});

// URLの有効な設定を復元し、無関係なパラメーターとフラグメントを維持して変更を書き戻す。
test('検索・分類・サイズをURLと履歴から復元する', async () => {
  const p = createPage('?q=通知&category=calendar&size=32&ref=docs#main');
  try {
    expect(p.visible()).toEqual(['calendar-bell']);
    expect(p.document.querySelector('svg')!.getAttribute('width')).toBe('32');
    const select = p.document.querySelector<HTMLSelectElement>('[data-icon-size]')!;
    select.value = '16'; select.dispatchEvent(new p.window.Event('change'));
    expect(p.window.location.search).toContain('size=16');
    expect(p.window.location.search).toContain('ref=docs');
    expect(p.window.location.hash).toBe('#main');
    p.window.history.replaceState(null, '', '/icons/?q=月&size=20');
    p.window.dispatchEvent(new p.window.PopStateEvent('popstate'));
    expect(p.visible()).toEqual(['moon']);
    expect(p.document.querySelector('svg')!.getAttribute('height')).toBe('20');
    p.search.value = '別の値'; p.window.dispatchEvent(new p.window.Event('pageshow'));
    expect(p.search.value).toBe('月');
  } finally { await p.window.happyDOM.close(); }
});

// 手入力された不正な分類・サイズが一覧を空にしたり、原本の実寸を壊したりしない。
test('不正なURL設定をすべての分類と24pxへ戻す', async () => {
  const p = createPage('?category=unknown&size=999');
  try {
    expect(p.visible()).toHaveLength(4);
    expect(p.document.querySelector('svg')!.getAttribute('width')).toBe('24');
    expect(p.document.querySelector('[data-icon-category="all"]')!.getAttribute('aria-pressed')).toBe('true');
    expect(p.document.querySelector<HTMLElement>('[data-icon-controls]')!.hidden).toBe(false);
  } finally { await p.window.happyDOM.close(); }
});

// 詳細に正しい用途・ルールURLを渡し、クリッピングIDを一覧と分離し、閉じたら選択元へ戻す。
test('詳細の内容とSVG参照を独立させ、選択元へフォーカスを戻す', async () => {
  const p = createPage();
  try {
    const card = p.document.querySelector<HTMLAnchorElement>('[data-name="moon"] [data-icon-card]')!;
    card.click();
    expect(p.dialog.hasAttribute('open')).toBe(true);
    expect(p.dialog.querySelector('[data-icon-detail-name]')!.textContent).toBe('moon');
    expect(p.dialog.querySelector('[data-icon-detail-description]')!.textContent).toBe('月');
    expect(p.dialog.querySelector('[data-icon-detail-link]')!.getAttribute('href')).toContain('icons-moon--docs');
    const ids = [...p.document.querySelectorAll('[id]')].map(element => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    const detail = p.dialog.querySelector('svg')!;
    expect(detail.getAttribute('width')).toBe('32');
    p.dialog.dispatchEvent(new p.window.Event('close'));
    expect(p.document.activeElement).toBe(card);
    const modified = new p.window.MouseEvent('click', { button: 0, ctrlKey: true, bubbles: true, cancelable: true });
    card.dispatchEvent(modified);
    expect(modified.defaultPrevented).toBe(false);
  } finally { await p.window.happyDOM.close(); }
});
